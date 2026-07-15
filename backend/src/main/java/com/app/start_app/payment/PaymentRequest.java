package com.app.start_app.payment;

import com.app.start_app.order.CreateOrderRequest;

import java.math.BigDecimal;

public class PaymentRequest {

    private CreateOrderRequest orderRequest;
    private BigDecimal amount;

    public CreateOrderRequest getOrderRequest() { return orderRequest; }
    public void setOrderRequest(CreateOrderRequest orderRequest) { this.orderRequest = orderRequest; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
