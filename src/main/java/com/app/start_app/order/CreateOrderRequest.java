package com.app.start_app.order;

import java.util.List;
import java.math.BigDecimal;

public class CreateOrderRequest {

    private Integer userId;
    private Integer addressId;
    private String deliveryAddress;
    private String paymentMethod;
    private BigDecimal distanceKm;
    private String district;
    private boolean emergencyPriority;
    private List<OrderItem> items;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Integer getAddressId() { return addressId; }
    public void setAddressId(Integer addressId) { this.addressId = addressId; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public boolean isEmergencyPriority() { return emergencyPriority; }
    public void setEmergencyPriority(boolean emergencyPriority) { this.emergencyPriority = emergencyPriority; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
