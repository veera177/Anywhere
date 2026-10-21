package com.app.start_app.delivery;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/distance")
@CrossOrigin(origins = "*")
public class DistanceController {

    @PostMapping
    public DistanceResponse calculate(@RequestBody DistanceRequest request) {
        double km = DistanceCalculatorUtil.calculateDistanceKm(
                request.getLat1(), request.getLon1(), request.getLat2(), request.getLon2());
        DistanceResponse response = new DistanceResponse();
        response.setDistanceKm(DistanceCalculatorUtil.distanceKmRounded(km));
        response.setUnit("km");
        return response;
    }

    public static class DistanceRequest {
        private BigDecimal lat1;
        private BigDecimal lon1;
        private BigDecimal lat2;
        private BigDecimal lon2;

        public BigDecimal getLat1() { return lat1; }
        public void setLat1(BigDecimal lat1) { this.lat1 = lat1; }
        public BigDecimal getLon1() { return lon1; }
        public void setLon1(BigDecimal lon1) { this.lon1 = lon1; }
        public BigDecimal getLat2() { return lat2; }
        public void setLat2(BigDecimal lat2) { this.lat2 = lat2; }
        public BigDecimal getLon2() { return lon2; }
        public void setLon2(BigDecimal lon2) { this.lon2 = lon2; }
    }

    public static class DistanceResponse {
        private BigDecimal distanceKm;
        private String unit;

        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
    }
}