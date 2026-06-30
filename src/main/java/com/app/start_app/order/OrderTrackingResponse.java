package com.app.start_app.order;

import java.time.LocalDateTime;

public class OrderTrackingResponse {

    private Integer orderId;
    private String trackingStatus;
    private LocalDateTime estimatedDeliveryTime;

    public OrderTrackingResponse() {
    }

    public OrderTrackingResponse(Integer orderId, String trackingStatus, LocalDateTime estimatedDeliveryTime) {
        this.orderId = orderId;
        this.trackingStatus = trackingStatus;
        this.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public String getTrackingStatus() { return trackingStatus; }
    public void setTrackingStatus(String trackingStatus) { this.trackingStatus = trackingStatus; }
    public LocalDateTime getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(LocalDateTime estimatedDeliveryTime) {
        this.estimatedDeliveryTime = estimatedDeliveryTime;
    }
}
