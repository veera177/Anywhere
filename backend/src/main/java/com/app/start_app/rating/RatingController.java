package com.app.start_app.rating;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * RatingController — exposes the ratings REST API.
 *
 * POST /api/ratings          — submit a rating (requires JWT)
 * GET  /api/ratings/{type}/{id} — get aggregate + recent reviews (public)
 *
 * JWT userId is read from the request attribute set by JwtAuthenticationFilter,
 * which is the established pattern throughout this codebase.
 */
@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    /**
     * Submit a rating for a shop or delivery partner.
     * Requires: Authorization: Bearer {token}
     * Body: { orderId, targetType, targetId, stars, comment? }
     */
    @PostMapping
    public ResponseEntity<?> submitRating(
            @RequestBody RatingRequest request,
            HttpServletRequest httpRequest
    ) {
        // Extract authenticated userId from JWT filter attribute
        Object userIdAttr = httpRequest.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        Integer authenticatedUserId = ((Number) userIdAttr).intValue();

        try {
            Rating created = ratingService.submitRating(authenticatedUserId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get aggregate rating + recent reviews for a shop or delivery partner.
     * Public — no authentication required.
     *
     * @param targetType RESTAURANT | GROCERY | PHARMACY | DELIVERY_PARTNER
     * @param targetId   shop id or courier_id
     */
    @GetMapping("/{targetType}/{targetId}")
    public ResponseEntity<?> getSummary(
            @PathVariable String targetType,
            @PathVariable Integer targetId
    ) {
        try {
            RatingSummary summary = ratingService.getSummary(targetType, targetId);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
