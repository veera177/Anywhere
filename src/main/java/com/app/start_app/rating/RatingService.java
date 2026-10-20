package com.app.start_app.rating;

import com.app.start_app.order.Order;
import com.app.start_app.order.OrderDAO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * RatingService — business logic for post-delivery ratings.
 *
 * Rules enforced here:
 * 1. The order must belong to the authenticated user (JWT userId).
 * 2. The order status must be DELIVERED.
 * 3. Only one rating per order per target type (checked before insert;
 *    DB unique key also guards it).
 * 4. Allowed target types: RESTAURANT, GROCERY, PHARMACY, DELIVERY_PARTNER.
 * 5. stars must be 1–5; comment ≤ 300 chars.
 */
@Service
public class RatingService {

    private static final Set<String> VALID_TARGET_TYPES = Set.of(
            "RESTAURANT", "GROCERY", "PHARMACY", "DELIVERY_PARTNER"
    );

    private final RatingDAO ratingDAO;
    private final OrderDAO  orderDAO;

    public RatingService(RatingDAO ratingDAO, OrderDAO orderDAO) {
        this.ratingDAO = ratingDAO;
        this.orderDAO  = orderDAO;
    }

    // ------------------------------------------------------------------
    // POST /api/ratings
    // ------------------------------------------------------------------

    @Transactional
    public Rating submitRating(Integer authenticatedUserId, RatingRequest req) {

        // 1. Basic field validation
        validateRequest(req);

        // 2. Load order and verify ownership + status
        Order order = orderDAO.findById(req.getOrderId());
        if (order == null) {
            throw new IllegalArgumentException("Order not found");
        }
        if (!order.getUserId().equals(authenticatedUserId)) {
            throw new SecurityException("Order does not belong to the authenticated user");
        }
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Ratings can only be submitted for delivered orders");
        }

        // 3. Duplicate check
        String normalizedType = req.getTargetType().toUpperCase();
        if (ratingDAO.existsRating(req.getOrderId(), normalizedType)) {
            throw new IllegalStateException("You have already rated this target for order #" + req.getOrderId());
        }

        // 4. Build & insert
        Rating rating = new Rating();
        rating.setOrderId(req.getOrderId());
        rating.setUserId(authenticatedUserId);
        rating.setTargetType(normalizedType);
        rating.setTargetId(req.getTargetId());
        rating.setStars(req.getStars());
        rating.setComment(sanitizeComment(req.getComment()));

        Integer newId = ratingDAO.insert(rating);
        rating.setId(newId);

        // 5. Update cached average on the shop table (no-op for DELIVERY_PARTNER)
        ratingDAO.updateShopAverageRating(normalizedType, req.getTargetId());

        return rating;
    }

    // ------------------------------------------------------------------
    // GET /api/ratings/{targetType}/{targetId}
    // ------------------------------------------------------------------

    public RatingSummary getSummary(String targetType, Integer targetId) {
        String normalizedType = targetType.toUpperCase();
        if (!VALID_TARGET_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("Invalid targetType: " + targetType);
        }
        return ratingDAO.getSummary(normalizedType, targetId);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void validateRequest(RatingRequest req) {
        if (req.getOrderId() == null) {
            throw new IllegalArgumentException("orderId is required");
        }
        if (req.getTargetType() == null || !VALID_TARGET_TYPES.contains(req.getTargetType().toUpperCase())) {
            throw new IllegalArgumentException("targetType must be one of: " + VALID_TARGET_TYPES);
        }
        if (req.getTargetId() == null) {
            throw new IllegalArgumentException("targetId is required");
        }
        if (req.getStars() == null || req.getStars() < 1 || req.getStars() > 5) {
            throw new IllegalArgumentException("stars must be between 1 and 5");
        }
        if (req.getComment() != null && req.getComment().length() > 300) {
            throw new IllegalArgumentException("comment must not exceed 300 characters");
        }
    }

    /** Trim whitespace; return null for blank comments so they are stored as NULL. */
    private String sanitizeComment(String comment) {
        if (comment == null || comment.isBlank()) return null;
        return comment.trim();
    }
}
