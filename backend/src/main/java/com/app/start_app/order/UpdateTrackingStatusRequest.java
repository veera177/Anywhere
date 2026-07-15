package com.app.start_app.order;

public class UpdateTrackingStatusRequest {

    private Integer orderId;
    private String status;

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
