package com.app.start_app.delivery;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Shared Haversine distance calculator used across all Anywhere services
 * (Food, Grocery, Medicine, Courier). Free / offline — no external API.
 *
 * distance = 6371 * 2 * atan2(sqrt(a), sqrt(1 - a))
 * where a = sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLon/2)
 */
public final class DistanceCalculatorUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private DistanceCalculatorUtil() {
    }

    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double sinLat = Math.sin(dLat / 2);
        double sinLon = Math.sin(dLon / 2);

        double a = sinLat * sinLat
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * sinLon * sinLon;
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    public static double calculateDistanceKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        return calculateDistanceKm(
                lat1 == null ? 0 : lat1.doubleValue(),
                lon1 == null ? 0 : lon1.doubleValue(),
                lat2 == null ? 0 : lat2.doubleValue(),
                lon2 == null ? 0 : lon2.doubleValue()
        );
    }

    public static BigDecimal distanceKmRounded(double distanceKm) {
        return BigDecimal.valueOf(distanceKm).setScale(2, RoundingMode.HALF_UP);
    }
}