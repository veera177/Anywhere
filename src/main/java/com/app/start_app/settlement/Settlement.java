package com.app.start_app.settlement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Settlement {
    private Integer id;
    private Integer orderId;
    private Integer partnerId;
    private Integer deliveryPartnerId;
    private String serviceType;
    private BigDecimal productTotal;
    private BigDecimal commissionAmount;
    private BigDecimal deliveryFee;
    private BigDecimal partnerPayout;
    private BigDecimal deliveryPartnerPayout;
    private BigDecimal platformEarning;
    private BigDecimal refundAmount;
    private String settlementStatus;
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public Integer getPartnerId() { return partnerId; }
    public void setPartnerId(Integer partnerId) { this.partnerId = partnerId; }
    public Integer getDeliveryPartnerId() { return deliveryPartnerId; }
    public void setDeliveryPartnerId(Integer deliveryPartnerId) { this.deliveryPartnerId = deliveryPartnerId; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    
    public BigDecimal getProductTotal() { return productTotal; }
    public void setProductTotal(BigDecimal productTotal) { this.productTotal = productTotal; }
    
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }
    
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
    
    public BigDecimal getPartnerPayout() { return partnerPayout; }
    public void setPartnerPayout(BigDecimal partnerPayout) { this.partnerPayout = partnerPayout; }

    public BigDecimal getDeliveryPartnerPayout() { return deliveryPartnerPayout; }
    public void setDeliveryPartnerPayout(BigDecimal deliveryPartnerPayout) { this.deliveryPartnerPayout = deliveryPartnerPayout; }
    
    public BigDecimal getPlatformEarning() { return platformEarning; }
    public void setPlatformEarning(BigDecimal platformEarning) { this.platformEarning = platformEarning; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getSettlementStatus() { return settlementStatus; }
    public void setSettlementStatus(String settlementStatus) { this.settlementStatus = settlementStatus; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
