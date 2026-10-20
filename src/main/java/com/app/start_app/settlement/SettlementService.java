package com.app.start_app.settlement;

import com.app.start_app.delivery.DeliveryFeeCalculator;
import com.app.start_app.order.Order;
import com.app.start_app.platform.PlatformSettingDAO;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class SettlementService {

    private final SettlementDAO settlementDAO;
    private final PlatformSettingDAO settings;
    private final DeliveryFeeCalculator deliveryFeeCalculator;

    public SettlementService(SettlementDAO settlementDAO, PlatformSettingDAO settings,
                             DeliveryFeeCalculator deliveryFeeCalculator) {
        this.settlementDAO = settlementDAO;
        this.settings = settings;
        this.deliveryFeeCalculator = deliveryFeeCalculator;
    }

    @PostConstruct
    public void init() {
        settlementDAO.createTableIfNotExists();
    }

    public void calculateAndSaveSettlement(Order order, String district) {
        calculateAndSaveSettlement(order, district, BigDecimal.ZERO);
    }

    public void calculateAndSaveSettlement(Order order, String district, BigDecimal refundAmount) {
        int tier = districtTier(district);

        String serviceType = normalizeServiceType(order.getItems().get(0).getServiceType());

        BigDecimal originalProductTotal = order.getProductTotal() != null ? order.getProductTotal() : BigDecimal.ZERO;
        BigDecimal safeRefund = positive(refundAmount);
        BigDecimal productTotal = originalProductTotal.subtract(safeRefund);
        if (productTotal.signum() < 0) {
            productTotal = BigDecimal.ZERO;
        }

        BigDecimal deliveryFee = order.getFinalDeliveryFee() != null ? order.getFinalDeliveryFee() : BigDecimal.ZERO;

        BigDecimal commissionAmount = BigDecimal.ZERO;
        BigDecimal partnerPayout = BigDecimal.ZERO;
        BigDecimal deliveryPartnerPayout;
        BigDecimal platformEarning;

        if ("courier".equals(serviceType)) {
            // Additive, commission-free courier model: the delivery partner keeps
            // 100% of the distance-based fee and Anywhere earns the settings-driven
            // platform fee on top. Single source of truth: DeliveryFeeCalculator.
            platformEarning = deliveryFeeCalculator.calculateCourierPlatformFee(deliveryFee);
            deliveryPartnerPayout = deliveryFee;
        } else {
            BigDecimal commissionPct = settings.getRequiredDecimal("settlement." + serviceType + ".commission_pct");
            BigDecimal commissionFloor = settings.getRequiredDecimal("settlement.commission_floor");
            BigDecimal calculatedCommission = productTotal.multiply(commissionPct)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            commissionAmount = productTotal.signum() == 0
                    ? BigDecimal.ZERO
                    : calculatedCommission.compareTo(commissionFloor) > 0 ? calculatedCommission : commissionFloor;

            partnerPayout = productTotal.subtract(commissionAmount);
            if (partnerPayout.signum() < 0) {
                partnerPayout = BigDecimal.ZERO;
            }

            BigDecimal topUp = BigDecimal.ZERO;
            if (tier == 3) {
                BigDecimal topUpPct = settings.getRequiredDecimal("settlement.tier3.delivery_partner_topup_pct");
                topUp = commissionAmount.multiply(topUpPct)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            deliveryPartnerPayout = deliveryFee.add(topUp);
            platformEarning = commissionAmount.subtract(topUp);
            if (platformEarning.signum() < 0) {
                platformEarning = BigDecimal.ZERO;
            }
        }

        Settlement settlement = new Settlement();
        settlement.setOrderId(order.getId());
        settlement.setServiceType(serviceType);
        settlement.setProductTotal(scale(productTotal));
        settlement.setCommissionAmount(scale(commissionAmount));
        settlement.setDeliveryFee(scale(deliveryFee));
        settlement.setPartnerPayout(scale(partnerPayout));
        settlement.setDeliveryPartnerPayout(scale(deliveryPartnerPayout));
        settlement.setPlatformEarning(scale(platformEarning));
        settlement.setRefundAmount(scale(safeRefund));
        settlement.setSettlementStatus("PENDING");

        settlementDAO.insertSettlement(settlement);
    }

    private int districtTier(String district) {
        String districtKey = district == null || district.isBlank()
                ? "unknown"
                : district.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_");
        BigDecimal tier = settings.getDecimal("district." + districtKey + ".tier");
        if (tier.signum() == 0) {
            tier = settings.getRequiredDecimal("district.default.tier");
        }
        return tier.intValue();
    }

    private BigDecimal positive(BigDecimal value) {
        if (value == null || value.signum() < 0) return BigDecimal.ZERO;
        return value;
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
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
}
