package com.app.start_app.courier;

import com.app.start_app.delivery.DeliveryFeeBreakdown;
import com.app.start_app.delivery.DeliveryFeeCalculator;
import com.app.start_app.delivery.DistanceCalculatorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourierTrackingService {

    private static final double AVERAGE_SPEED_KM_PER_MIN = 0.65;

    private final CourierTrackingDAO courierTrackingDAO;
    private final DeliveryFeeCalculator deliveryFeeCalculator;

    public CourierTrackingService(CourierTrackingDAO courierTrackingDAO,
                                  DeliveryFeeCalculator deliveryFeeCalculator) {
        this.courierTrackingDAO = courierTrackingDAO;
        this.deliveryFeeCalculator = deliveryFeeCalculator;
    }

    @Transactional
    public CourierRoute createRoute(CourierRoute route) {
        double distanceKm = DistanceCalculatorUtil.calculateDistanceKm(
                route.getPickupLatitude(), route.getPickupLongitude(),
                route.getDeliveryLatitude(), route.getDeliveryLongitude());
        int minutes = Math.max(1, (int) Math.round(distanceKm / AVERAGE_SPEED_KM_PER_MIN));
        route.setEstimatedDurationMinutes(minutes);
        route.setStatus("PENDING");

        Integer routeId = courierTrackingDAO.insertRoute(route);
        route.setId(routeId);
        route.setLocationHistory(courierTrackingDAO.findLocationsByRouteId(routeId));
        return route;
    }

    @Transactional
    public RouteLocation addLocation(RouteLocation location) {
        // The web client calls this endpoint with "courierId" as the route id.
        if (location.getRouteId() == null && location.getCourierId() != null) {
            location.setRouteId(location.getCourierId());
        }
        if (courierTrackingDAO.findRouteById(location.getRouteId()) == null) {
            throw new IllegalArgumentException("Courier route not found");
        }
        location.setStatus("PENDING");
        location.setSortOrder(courierTrackingDAO.nextSortOrder(location.getRouteId()));
        location.setDistanceFromPrevious(previousDistance(location));
        Integer locationId = courierTrackingDAO.insertLocation(location);
        return courierTrackingDAO.findLocationById(locationId);
    }

    public Map<String, Object> getRouteDetails(Integer routeId) {
        CourierRoute route = courierTrackingDAO.findRouteById(routeId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found");
        }
        List<RouteLocation> locations = courierTrackingDAO.findLocationsByRouteId(routeId);
        route.setLocationHistory(locations);
        Map<String, Object> response = new HashMap<>();
        response.put("route", route);
        response.put("totalDistance", totalDistanceKm(route));
        return response;
    }

    public CourierRoute getRoute(Integer routeId) { return courierTrackingDAO.findRouteById(routeId); }

    public double getTotalDistance(Integer routeId) {
        CourierRoute route = courierTrackingDAO.findRouteById(routeId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found");
        }
        return totalDistanceKm(route);
    }

    @Transactional
    public CourierRoute startRoute(Integer routeId) {
        CourierRoute route = courierTrackingDAO.findRouteById(routeId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found");
        }
        if ("DELIVERED".equals(route.getStatus())) {
            throw new IllegalStateException("Route already delivered");
        }
        courierTrackingDAO.updateRouteStatus(routeId, "IN_TRANSIT", LocalDateTime.now(), null);
        route.setStatus("IN_TRANSIT");
        route.setStartedAt(LocalDateTime.now());
        return route;
    }

    @Transactional
    public CourierRoute completeRoute(Integer routeId) {
        CourierRoute route = courierTrackingDAO.findRouteById(routeId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found");
        }
        int duration = route.getStartedAt() == null
                ? 0
                : (int) Math.max(0, java.time.Duration.between(route.getStartedAt(), LocalDateTime.now()).toMinutes());
        courierTrackingDAO.updateRouteActualDuration(routeId, duration);
        courierTrackingDAO.updateRouteStatus(routeId, "DELIVERED", route.getStartedAt(), LocalDateTime.now());
        route.setStatus("DELIVERED");
        route.setCompletedAt(LocalDateTime.now());
        route.setActualDurationMinutes(duration);
        return route;
    }

    @Transactional
    public RouteLocation markLocationReached(Integer locationId) {
        RouteLocation location = courierTrackingDAO.findLocationById(locationId);
        if (location == null) {
            throw new IllegalArgumentException("Location not found");
        }
        courierTrackingDAO.updateLocationStatus(locationId, "REACHED", false);
        return courierTrackingDAO.findLocationById(locationId);
    }

    @Transactional
    public RouteLocation markLocationCompleted(Integer locationId) {
        RouteLocation location = courierTrackingDAO.findLocationById(locationId);
        if (location == null) {
            throw new IllegalArgumentException("Location not found");
        }
        courierTrackingDAO.updateLocationStatus(locationId, "COMPLETED", true);
        return courierTrackingDAO.findLocationById(locationId);
    }

    public String getLocationStatus(Integer locationId) {
        RouteLocation location = courierTrackingDAO.findLocationById(locationId);
        if (location == null) {
            throw new IllegalArgumentException("Location not found");
        }
        return location.getStatus();
    }

    public String getRouteStatus(Integer routeId) {
        CourierRoute route = courierTrackingDAO.findRouteById(routeId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found");
        }
        return route.getStatus();
    }

    /**
     * Delegates to the single existing DeliveryFeeCalculator so courier pricing is
     * never hardcoded. `district` drives the tier; when absent the configured
     * default tier applies. Enforces the settings-driven courier radius.
     */
    public Map<String, Object> calculateDeliveryFee(BigDecimal distanceKm, String district) {
        DeliveryFeeBreakdown breakdown = deliveryFeeCalculator.calculateDeliveryFee(
                "courier", distanceKm, BigDecimal.ZERO, false, district);
        Map<String, Object> response = new HashMap<>();
        response.put("distanceKm", breakdown.getDistanceKm());
        response.put("fee", breakdown.getFinalDeliveryFee());
        response.put("deliveryFee", breakdown.getFinalDeliveryFee());
        response.put("platformFee", breakdown.getPlatformFee());
        response.put("deliveryPartnerPayout", breakdown.getDeliveryPartnerPayout());
        response.put("serviceRadiusKm", breakdown.getServiceRadiusKm());
        response.put("districtTier", breakdown.getDistrictTier());
        response.put("currency", "INR");
        return response;
    }

    private double previousDistance(RouteLocation location) {
        if (location.getSortOrder() <= 1) {
            return 0.0;
        }
        List<RouteLocation> previous = courierTrackingDAO.findLocationsByRouteId(location.getRouteId());
        for (RouteLocation p : previous) {
            if (p.getSortOrder() == location.getSortOrder() - 1) {
                return DistanceCalculatorUtil.calculateDistanceKm(
                        p.getLatitude(), p.getLongitude(),
                        location.getLatitude(), location.getLongitude());
            }
        }
        return 0.0;
    }

    private double totalDistanceKm(CourierRoute route) {
        return DistanceCalculatorUtil.calculateDistanceKm(
                route.getPickupLatitude(), route.getPickupLongitude(),
                route.getDeliveryLatitude(), route.getDeliveryLongitude());
    }
}
