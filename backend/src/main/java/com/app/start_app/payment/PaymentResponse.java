package com.app.start_app.payment;

import com.app.start_app.order.Order;

import java.math.BigDecimal;

public class PaymentResponse {

    private Payment payment;
    private Order order;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private BigDecimal amount;
    private Integer amountInPaise;
    private String currency;
    private String testSignature;

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getAmountInPaise() { return amountInPaise; }
    public void setAmountInPaise(Integer amountInPaise) { this.amountInPaise = amountInPaise; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getTestSignature() { return testSignature; }
    public void setTestSignature(String testSignature) { this.testSignature = testSignature; }
}
