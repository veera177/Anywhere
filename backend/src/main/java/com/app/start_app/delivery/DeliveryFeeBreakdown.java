package com.app.start_app.delivery;

import java.math.BigDecimal;

public class DeliveryFeeBreakdown {

    private String serviceType;
    private BigDecimal distanceKm;
    private BigDecimal orderTotal;
    private Integer districtTier;
    private BigDecimal serviceRadiusKm;
    private BigDecimal baseFee;
    private BigDecimal firstBandRate;
    private BigDecimal secondBandRate;
    private BigDecimal originalDeliveryFee;
    private BigDecimal maxDeliveryFee;
    private BigDecimal emergencyPrioritySurcharge;
    private BigDecimal deliveryDiscount;
    private BigDecimal finalDeliveryFee;
    private boolean freeDeliveryApplied;
    private String estimatedDeliveryTime;
    // Courier-only: the additive Anywhere platform fee the customer pays on top of
    // the distance-based delivery fee, and the 100% payout the delivery partner gets.
    private BigDecimal platformFee;
    private BigDecimal deliveryPartnerPayout;

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    public BigDecimal getOrderTotal() { return orderTotal; }
    public void setOrderTotal(BigDecimal orderTotal) { this.orderTotal = orderTotal; }
    public Integer getDistrictTier() { return districtTier; }
    public void setDistrictTier(Integer districtTier) { this.districtTier = districtTier; }
    public BigDecimal getServiceRadiusKm() { return serviceRadiusKm; }
    public void setServiceRadiusKm(BigDecimal serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }
    public BigDecimal getBaseFee() { return baseFee; }
    public void setBaseFee(BigDecimal baseFee) { this.baseFee = baseFee; }
    public BigDecimal getFirstBandRate() { return firstBandRate; }
    public void setFirstBandRate(BigDecimal firstBandRate) { this.firstBandRate = firstBandRate; }
    public BigDecimal getSecondBandRate() { return secondBandRate; }
    public void setSecondBandRate(BigDecimal secondBandRate) { this.secondBandRate = secondBandRate; }
    public BigDecimal getOriginalDeliveryFee() { return originalDeliveryFee; }
    public void setOriginalDeliveryFee(BigDecimal originalDeliveryFee) { this.originalDeliveryFee = originalDeliveryFee; }
    public BigDecimal getMaxDeliveryFee() { return maxDeliveryFee; }
    public void setMaxDeliveryFee(BigDecimal maxDeliveryFee) { this.maxDeliveryFee = maxDeliveryFee; }
    public BigDecimal getEmergencyPrioritySurcharge() { return emergencyPrioritySurcharge; }
    public void setEmergencyPrioritySurcharge(BigDecimal emergencyPrioritySurcharge) { this.emergencyPrioritySurcharge = emergencyPrioritySurcharge; }
    public BigDecimal getDeliveryDiscount() { return deliveryDiscount; }
    public void setDeliveryDiscount(BigDecimal deliveryDiscount) { this.deliveryDiscount = deliveryDiscount; }
    public BigDecimal getFinalDeliveryFee() { return finalDeliveryFee; }
    public void setFinalDeliveryFee(BigDecimal finalDeliveryFee) { this.finalDeliveryFee = finalDeliveryFee; }
    public boolean isFreeDeliveryApplied() { return freeDeliveryApplied; }
    public void setFreeDeliveryApplied(boolean freeDeliveryApplied) { this.freeDeliveryApplied = freeDeliveryApplied; }
    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public BigDecimal getDeliveryPartnerPayout() { return deliveryPartnerPayout; }
    public void setDeliveryPartnerPayout(BigDecimal deliveryPartnerPayout) { this.deliveryPartnerPayout = deliveryPartnerPayout; }
}
