package com.app.start_app.order;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

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

    public OrderService(OrderDAO orderDAO) {
        this.orderDAO = orderDAO;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        validateRequest(request);
        String address = request.getDeliveryAddress();
        if (address == null || address.isBlank()) {
            address = request.getAddressId() == null
                    ? orderDAO.getProfileAddressSnapshot(request.getUserId())
                    : orderDAO.getAddressSnapshot(request.getUserId(), request.getAddressId());
        }
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("Please add a delivery address in your profile");
        }

        BigDecimal total = request.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer orderId = orderDAO.insertOrder(request, address, total);
        request.getItems().forEach(item -> orderDAO.insertItem(orderId, item));
        String orderedService = request.getItems().get(0).getServiceType();
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

        return normalized;
    }

    public boolean updateStatus(Integer orderId, String status) {
        updateTrackingStatus(orderId, status);
        return true;
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
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
