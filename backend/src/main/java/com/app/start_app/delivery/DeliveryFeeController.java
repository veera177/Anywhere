package com.app.start_app.delivery;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-fee")
@CrossOrigin(origins = "*")
public class DeliveryFeeController {

    private final DeliveryFeeCalculator calculator;

    public DeliveryFeeController(DeliveryFeeCalculator calculator) {
        this.calculator = calculator;
    }

    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestBody DeliveryFeePreviewRequest request) {
        try {
            return ResponseEntity.ok(calculator.calculateDeliveryFee(
                    request.getServiceType(),
                    request.getDistanceKm(),
                    request.getOrderTotal(),
                    request.isFirstOrder(),
                    request.getDistrict(),
                    request.isEmergencyPriority()
            ));
        } catch (IllegalArgumentException exception) {
            // Radius violations ("... is available up to 30 km in this district")
            // are client-input errors, not auth failures — return 400 with the
            // settings-driven message so the UI can show the service-area notice.
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    public static class DeliveryFeePreviewRequest {
        private String serviceType;
        private String district;
        private BigDecimal distanceKm;
        private BigDecimal orderTotal;
        private boolean firstOrder;
        private boolean emergencyPriority;

        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
        public BigDecimal getOrderTotal() { return orderTotal; }
        public void setOrderTotal(BigDecimal orderTotal) { this.orderTotal = orderTotal; }
        public boolean isFirstOrder() { return firstOrder; }
        public void setFirstOrder(boolean firstOrder) { this.firstOrder = firstOrder; }
        public boolean isEmergencyPriority() { return emergencyPriority; }
        public void setEmergencyPriority(boolean emergencyPriority) { this.emergencyPriority = emergencyPriority; }
    }
}
