package com.app.start_app.courier;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.app.start_app.security.CurrentUser;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/courier/tracking")
@CrossOrigin(origins = "*")
public class CourierTrackingController {

    private final CourierTrackingService courierTrackingService;

    public CourierTrackingController(CourierTrackingService courierTrackingService) {
        this.courierTrackingService = courierTrackingService;
    }

    @PostMapping("/create-route")
    public ResponseEntity<?> createRoute(@RequestBody CourierRoute route, @AuthenticationPrincipal Integer userId) {
        try {
            route.setUserId(CurrentUser.require(userId));
            return ResponseEntity.status(HttpStatus.CREATED).body(courierTrackingService.createRoute(route));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/add-location")
    public ResponseEntity<?> addLocation(@RequestBody RouteLocation location) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(courierTrackingService.addLocation(location));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/route/{routeId}")
    public ResponseEntity<?> getRouteDetails(@PathVariable Integer routeId, @AuthenticationPrincipal Integer userId) {
        try {
            requireRouteOwner(routeId, userId);
            return ResponseEntity.ok(courierTrackingService.getRouteDetails(routeId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/start/{routeId}")
    public ResponseEntity<?> startRoute(@PathVariable Integer routeId) {
        try {
            return ResponseEntity.ok(courierTrackingService.startRoute(routeId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/complete/{routeId}")
    public ResponseEntity<?> completeRoute(@PathVariable Integer routeId) {
        try {
            return ResponseEntity.ok(courierTrackingService.completeRoute(routeId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/distance/{courierId}")
    public ResponseEntity<?> getTotalDistance(@PathVariable Integer courierId) {
        try {
            return ResponseEntity.ok(Map.of("distanceKm", courierTrackingService.getTotalDistance(courierId)));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/location/{locationId}/reached")
    public ResponseEntity<?> markLocationReached(@PathVariable Integer locationId) {
        try {
            return ResponseEntity.ok(courierTrackingService.markLocationReached(locationId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/location/{locationId}/completed")
    public ResponseEntity<?> markLocationCompleted(@PathVariable Integer locationId) {
        try {
            return ResponseEntity.ok(courierTrackingService.markLocationCompleted(locationId));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/location/{locationId}/status")
    public ResponseEntity<?> getLocationStatus(@PathVariable Integer locationId) {
        try {
            return ResponseEntity.ok(Map.of("status", courierTrackingService.getLocationStatus(locationId)));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/route/{routeId}/status")
    public ResponseEntity<?> getRouteStatus(@PathVariable Integer routeId) {
        try {
            return ResponseEntity.ok(Map.of("status", courierTrackingService.getRouteStatus(routeId)));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/calculate-fee")
    public ResponseEntity<?> calculateFee(@RequestBody Map<String, Object> request) {
        BigDecimal distanceKm = new BigDecimal(String.valueOf(request.getOrDefault("distanceKm", 0)));
        String areaTier = request.get("areaTier") == null ? "URBAN" : String.valueOf(request.get("areaTier"));
        return ResponseEntity.ok(courierTrackingService.calculateDeliveryFee(distanceKm, areaTier));
    }

    private void requireRouteOwner(Integer routeId, Integer userId) {
        CourierRoute route = courierTrackingService.getRoute(routeId);
        if (route == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Courier route not found");
        CurrentUser.owns(userId, route.getUserId());
    }
}
