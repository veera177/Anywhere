package com.app.start_app.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Order {

    private Integer id;
    private Integer userId;
    private Integer addressId;
    private String deliveryAddress;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal productTotal;
    private BigDecimal distanceKm;
    private BigDecimal deliveryFeeOriginal;
    private BigDecimal deliveryDiscount;
    private BigDecimal finalDeliveryFee;
    private String deliveryEtaLabel;
    private String status;
    private String trackingStatus;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime orderedAt;
    private List<OrderItem> items;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Integer getAddressId() { return addressId; }
    public void setAddressId(Integer addressId) { this.addressId = addressId; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getProductTotal() { return productTotal; }
    public void setProductTotal(BigDecimal productTotal) { this.productTotal = productTotal; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    public BigDecimal getDeliveryFeeOriginal() { return deliveryFeeOriginal; }
    public void setDeliveryFeeOriginal(BigDecimal deliveryFeeOriginal) { this.deliveryFeeOriginal = deliveryFeeOriginal; }
    public BigDecimal getDeliveryDiscount() { return deliveryDiscount; }
    public void setDeliveryDiscount(BigDecimal deliveryDiscount) { this.deliveryDiscount = deliveryDiscount; }
    public BigDecimal getFinalDeliveryFee() { return finalDeliveryFee; }
    public void setFinalDeliveryFee(BigDecimal finalDeliveryFee) { this.finalDeliveryFee = finalDeliveryFee; }
    public String getDeliveryEtaLabel() { return deliveryEtaLabel; }
    public void setDeliveryEtaLabel(String deliveryEtaLabel) { this.deliveryEtaLabel = deliveryEtaLabel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTrackingStatus() { return trackingStatus; }
    public void setTrackingStatus(String trackingStatus) { this.trackingStatus = trackingStatus; }
    public LocalDateTime getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(LocalDateTime estimatedDeliveryTime) {
        this.estimatedDeliveryTime = estimatedDeliveryTime;
    }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    /**
     * Derived convenience field — the service type of the first order item.
     * The frontend uses this to distinguish COURIER from other orders.
     */
    public String getServiceType() {
        if (items == null || items.isEmpty()) return null;
        return items.get(0).getServiceType();
    }

    /**
     * Route ID for COURIER orders — stored in the delivery address as a structured string.
     * The frontend uses this to show the courier tracking map.
     */
    public Integer getRouteId() {
        if (items == null || items.isEmpty()) return null;
        for (OrderItem item : items) {
            if ("COURIER".equalsIgnoreCase(item.getServiceType())) {
                return item.getProductId(); // routeId is stored as productId for courier items
            }
        }
        return null;
    }
}
