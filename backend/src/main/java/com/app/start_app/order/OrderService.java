package com.app.start_app.order;

import com.app.start_app.delivery.DeliveryFeeBreakdown;
import com.app.start_app.delivery.DeliveryFeeCalculator;
import com.app.start_app.prescription.PrescriptionService;
import com.app.start_app.settlement.SettlementService;
import com.app.start_app.user.Address;
import com.app.start_app.user.AddressDAO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class OrderService {

    private static final Set<String> TRACKING_STATUSES = Set.of(
            "ORDER_PLACED",
            "RESTAURANT_ACCEPTED",
            "PREPARING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
    );

    private static final Set<String> CANCELLABLE_STATUSES = Set.of(
            "ORDER_PLACED",
            "RESTAURANT_ACCEPTED"
    );

    private final OrderDAO orderDAO;
    private final DeliveryFeeCalculator deliveryFeeCalculator;
    private final SettlementService settlementService;
    private final AddressDAO addressDAO;
    private final PrescriptionService prescriptionService;
    private final OrderStatusPublisher orderStatusPublisher;

    public OrderService(OrderDAO orderDAO, DeliveryFeeCalculator deliveryFeeCalculator,
                        SettlementService settlementService, AddressDAO addressDAO,
                        PrescriptionService prescriptionService, OrderStatusPublisher orderStatusPublisher) {
        this.orderDAO = orderDAO;
        this.deliveryFeeCalculator = deliveryFeeCalculator;
        this.settlementService = settlementService;
        this.addressDAO = addressDAO;
        this.prescriptionService = prescriptionService;
        this.orderStatusPublisher = orderStatusPublisher;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        validateRequest(request);
        // Emergency priority changes routing/SLA only. It never bypasses medicine
        // prescription verification.
        prescriptionService.validateMedicineOrder(request.getUserId(), request.getItems());

        // Only trust an address id that actually belongs to this user. A client can
        // otherwise send the user's own id (the profile object carries it), which
        // violates the orders->addresses foreign key and turns into a 500.
        if (request.getAddressId() != null) {
            Address owned = addressDAO.getAddressById(request.getUserId(), request.getAddressId());
            if (owned == null) {
                request.setAddressId(null);
            }
        }

        String address = request.getDeliveryAddress();
        if (address == null || address.isBlank()) {
            address = request.getAddressId() == null
                    ? orderDAO.getProfileAddressSnapshot(request.getUserId())
                    : orderDAO.getAddressSnapshot(request.getUserId(), request.getAddressId());
        }
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("Please add a delivery address in your profile");
        }

        BigDecimal productTotal = request.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String orderedService = request.getItems().get(0).getServiceType();
        // Courier sends an explicit district so the correct tiered fee applies even
        // though its delivery address is a joined "FROM | TO | RECEIVER" string.
        String district = request.getDistrict() != null && !request.getDistrict().isBlank()
                ? request.getDistrict()
                : extractDistrictFromAddress(address);

        // For courier bookings the single item's price IS the distance-based delivery
        // fee (there is no product). Count it only once: in final_delivery_fee.
        if ("COURIER".equalsIgnoreCase(orderedService)) {
            productTotal = BigDecimal.ZERO;
        }
        
        DeliveryFeeBreakdown deliveryFee = deliveryFeeCalculator.calculateDeliveryFee(
                orderedService,
                request.getDistanceKm(),
                productTotal,
                false,
                district,
                request.isEmergencyPriority()
        );

        Integer orderId = orderDAO.insertOrder(request, address, productTotal, deliveryFee);
        request.getItems().forEach(item -> orderDAO.insertItem(orderId, item));
        prescriptionService.linkVerifiedPrescription(request.getUserId(), orderId, request.getItems());
        if (!"COURIER".equalsIgnoreCase(orderedService)) {
            orderDAO.clearCartService(request.getUserId(), orderedService);
        }
        return orderDAO.findById(orderId);
    }

    public List<Order> getUserOrders(Integer userId) {
        return orderDAO.findByUserId(userId);
    }

    public Order getOrder(Integer orderId) {
        return orderDAO.findById(orderId);
    }

    public SseEmitter subscribe(Integer orderId) {
        return orderStatusPublisher.subscribe(orderId);
    }

    public OrderTrackingResponse getTracking(Integer orderId) {
        OrderTrackingResponse tracking = orderDAO.findTrackingById(orderId);
        if (tracking == null) {
            throw new IllegalArgumentException("Order not found");
        }
        if (tracking.getTrackingStatus() == null || tracking.getTrackingStatus().isBlank()) {
            tracking.setTrackingStatus("ORDER_PLACED");
        }
        return tracking;
    }

    @Transactional
    public String updateTrackingStatus(Integer orderId, String status) {
        String normalized = normalizeStatus(status);
        if (!TRACKING_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid order status");
        }

        OrderTrackingResponse current = getTracking(orderId);
        String currentStatus = current.getTrackingStatus();

        if ("DELIVERED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
            throw new IllegalStateException("Order already finalized");
        }

        if ("CANCELLED".equals(normalized) && !CANCELLABLE_STATUSES.contains(currentStatus)) {
            throw new IllegalStateException("Order cannot be cancelled after preparation has started");
        }

        if (orderDAO.updateTrackingStatus(orderId, normalized) == 0) {
            throw new IllegalArgumentException("Order not found");
        }

        // Every status writer goes through this method, so publish exactly once.
        orderStatusPublisher.publish(orderId, getTracking(orderId));

        if ("DELIVERED".equals(normalized)) {
            Order order = orderDAO.findById(orderId);
            String district = extractDistrictFromAddress(order.getDeliveryAddress());
            settlementService.calculateAndSaveSettlement(order, district);
        }

        return normalized;
    }

    public boolean updateStatus(Integer orderId, String status) {
        updateTrackingStatus(orderId, status);
        return true;
    }

    /**
     * Reorder: re-add all items from a previous order back into the user's cart.
     * Returns lists of added and unavailable items.
     */
    public ReorderResult reorder(Integer orderId, Integer userId) {
        Order order = orderDAO.findById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Order not found");
        }
        return orderDAO.reorderItems(orderId, userId);
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }

    private String extractDistrictFromAddress(String addressStr) {
        if (addressStr == null) return "Unknown";
        String[] parts = addressStr.split(",");
        if (parts.length >= 2) {
            // Address snapshot formats:
            // "title: address, city, district - pincode" OR "address_line, Near landmark, town, district"
            String possibleDistrict = parts[parts.length - 1].split("-")[0].trim();
            if (!possibleDistrict.isEmpty()) {
                return possibleDistrict;
            }
        }
        return "Unknown";
    }

    private void validateRequest(CreateOrderRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User is required");
        }
        if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        for (OrderItem item : request.getItems()) {
            if (item.getProductId() == null || item.getProductName() == null || item.getPrice() == null
                    || item.getPrice().signum() < 0 || item.getQuantity() == null || item.getQuantity() < 1) {
                throw new IllegalArgumentException("Invalid order item");
            }
        }
    }
}
