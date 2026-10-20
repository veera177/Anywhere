package com.app.start_app.rating;

/**
 * RatingRequest — body for POST /api/ratings.
 * <p>
 * The userId is intentionally absent here; it is extracted from the JWT token
 * (request attribute "userId") inside RatingService to prevent spoofing.
 */
public class RatingRequest {

    private Integer orderId;
    private String  targetType;   // RESTAURANT | GROCERY | PHARMACY | DELIVERY_PARTNER
    private Integer targetId;
    private Integer stars;        // 1–5
    private String  comment;      // optional, max 300 chars

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }

    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
