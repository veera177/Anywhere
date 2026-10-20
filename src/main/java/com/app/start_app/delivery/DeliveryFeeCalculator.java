package com.app.start_app.delivery;

import com.app.start_app.platform.PlatformSettingDAO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class DeliveryFeeCalculator {

    private final PlatformSettingDAO settings;

    public DeliveryFeeCalculator(PlatformSettingDAO settings) {
        this.settings = settings;
    }

    public DeliveryFeeBreakdown calculateDeliveryFee(
            String serviceType,
            BigDecimal distanceKm,
            BigDecimal orderTotal,
            boolean isFirstOrder,
            String district
    ) {
        return calculateDeliveryFee(serviceType, distanceKm, orderTotal, isFirstOrder, district, false);
    }

    public DeliveryFeeBreakdown calculateDeliveryFee(
            String serviceType,
            BigDecimal distanceKm,
            BigDecimal orderTotal,
            boolean isFirstOrder,
            String district,
            boolean emergencyPriority
    ) {
        String prefix = normalizeServiceType(serviceType);
        BigDecimal safeDistance = positive(distanceKm);
        BigDecimal safeOrderTotal = positive(orderTotal);

        int tier = districtTier(district);
        String tierPrefix = "delivery." + prefix + ".tier" + tier + ".";

        BigDecimal radiusKm = settings.getRequiredDecimal("delivery." + prefix + ".radius_km");
        if (safeDistance.compareTo(radiusKm) > 0) {
            throw new IllegalArgumentException(prefix.toUpperCase() + " delivery is available up to "
                    + radiusKm.stripTrailingZeros().toPlainString() + " km in this district");
        }

        BigDecimal baseFee = settings.getRequiredDecimal(tierPrefix + "base_fee");
        BigDecimal baseDistanceKm = settings.getRequiredDecimal("delivery." + prefix + ".base_distance_km");
        BigDecimal firstBandLimitKm = settings.getRequiredDecimal("delivery." + prefix + ".first_band_limit_km");
        BigDecimal firstBandRate = settings.getRequiredDecimal(tierPrefix + "first_band_rate");
        BigDecimal secondBandRate = settings.getRequiredDecimal(tierPrefix + "second_band_rate");
        BigDecimal maxDeliveryFee = settings.getRequiredDecimal(tierPrefix + "max_fee");
        BigDecimal freeDeliveryThreshold = settings.getRequiredDecimal("delivery." + prefix + ".free_delivery_threshold");

        BigDecimal originalFee = baseFee
                .add(distanceCharge(safeDistance, baseDistanceKm, firstBandLimitKm, firstBandRate, secondBandRate));
        BigDecimal cappedFee = originalFee.compareTo(maxDeliveryFee) > 0
                ? maxDeliveryFee
                : originalFee;

        boolean freeDelivery = freeDeliveryThreshold.signum() > 0
                && safeOrderTotal.compareTo(freeDeliveryThreshold) >= 0;
        if (settings.getBoolean("first_order_free_delivery") && isFirstOrder) {
            freeDelivery = true;
        }

        BigDecimal emergencySurcharge = "medicine".equals(prefix) && emergencyPriority
                ? settings.getRequiredDecimal("delivery.medicine.emergency_priority_surcharge")
                : BigDecimal.ZERO;
        BigDecimal discount = freeDelivery ? cappedFee : BigDecimal.ZERO;
        BigDecimal finalFee = (freeDelivery ? BigDecimal.ZERO : cappedFee).add(emergencySurcharge);

        DeliveryFeeBreakdown breakdown = new DeliveryFeeBreakdown();
        breakdown.setServiceType(prefix.toUpperCase());
        breakdown.setDistanceKm(scale(safeDistance));
        breakdown.setOrderTotal(scale(safeOrderTotal));
        breakdown.setDistrictTier(tier);
        breakdown.setServiceRadiusKm(scale(radiusKm));
        breakdown.setBaseFee(scale(baseFee));
        breakdown.setFirstBandRate(scale(firstBandRate));
        breakdown.setSecondBandRate(scale(secondBandRate));
        breakdown.setOriginalDeliveryFee(scale(originalFee));
        breakdown.setMaxDeliveryFee(scale(maxDeliveryFee));
        breakdown.setEmergencyPrioritySurcharge(scale(emergencySurcharge));
        breakdown.setDeliveryDiscount(scale(discount));
        breakdown.setFinalDeliveryFee(scale(finalFee));
        breakdown.setFreeDeliveryApplied(freeDelivery);
        breakdown.setEstimatedDeliveryTime(estimatedDeliveryTime(prefix));

        // Courier is commission-free: the delivery partner keeps 100% of the
        // distance-based fee and Anywhere earns only the configured platform fee,
        // which is added on top of what the customer pays.
        if ("courier".equals(prefix)) {
            breakdown.setPlatformFee(scale(calculateCourierPlatformFee(finalFee)));
            breakdown.setDeliveryPartnerPayout(scale(finalFee));
        } else {
            breakdown.setPlatformFee(scale(BigDecimal.ZERO));
            breakdown.setDeliveryPartnerPayout(scale(BigDecimal.ZERO));
        }
        return breakdown;
    }

    /**
     * Additive courier platform fee — the single source of truth used by both the
     * fee preview and SettlementService. Reads settlement.courier.platform_fee_pct
     * and settlement.courier.platform_floor from platform_settings (never hardcoded).
     */
    public BigDecimal calculateCourierPlatformFee(BigDecimal deliveryFee) {
        BigDecimal safeFee = positive(deliveryFee);
        BigDecimal platformPct = settings.getRequiredDecimal("settlement.courier.platform_fee_pct");
        BigDecimal platformFloor = settings.getRequiredDecimal("settlement.courier.platform_floor");
        BigDecimal percentageFee = safeFee.multiply(platformPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return percentageFee.compareTo(platformFloor) > 0 ? percentageFee : platformFloor;
    }

    private BigDecimal distanceCharge(
            BigDecimal distanceKm,
            BigDecimal baseDistanceKm,
            BigDecimal firstBandLimitKm,
            BigDecimal firstBandRate,
            BigDecimal secondBandRate
    ) {
        BigDecimal firstBandDistance = distanceKm.min(firstBandLimitKm).subtract(baseDistanceKm);
        if (firstBandDistance.signum() < 0) {
            firstBandDistance = BigDecimal.ZERO;
        }

        BigDecimal secondBandDistance = distanceKm.subtract(firstBandLimitKm);
        if (secondBandDistance.signum() < 0) {
            secondBandDistance = BigDecimal.ZERO;
        }

        return firstBandDistance.multiply(firstBandRate)
                .add(secondBandDistance.multiply(secondBandRate));
    }

    private int districtTier(String district) {
        String districtKey = district == null || district.isBlank()
                ? "unknown"
                : district.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_");
        BigDecimal tier = settings.getDecimal("district." + districtKey + ".tier");
        if (tier.signum() == 0) {
            tier = settings.getRequiredDecimal("district.default.tier");
        }
        int value = tier.intValue();
        if (value < 1 || value > 3) {
            throw new IllegalStateException("Invalid district tier for " + districtKey + ": " + value);
        }
        return value;
    }

    private String normalizeServiceType(String serviceType) {
        if (serviceType == null) return "food";
        return switch (serviceType.trim().toLowerCase()) {
            case "grocery" -> "grocery";
            case "medicine" -> "medicine";
            case "courier" -> "courier";
            default -> "food";
        };
    }

    private String estimatedDeliveryTime(String serviceType) {
        return switch (serviceType) {
            case "courier" -> "45-70 mins";
            case "medicine" -> "25-45 mins";
            case "grocery" -> "35-55 mins";
            default -> "25-40 mins";
        };
    }

    private BigDecimal positive(BigDecimal value) {
        if (value == null || value.signum() < 0) return BigDecimal.ZERO;
        return value;
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
