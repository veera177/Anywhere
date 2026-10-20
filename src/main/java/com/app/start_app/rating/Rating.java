package com.app.start_app.rating;

import java.time.LocalDateTime;

/**
 * Rating — entity mapped to the `ratings` table.
 * Represents one post-delivery star rating left by a customer for a shop or
 * delivery partner.
 */
public class Rating {

    private Integer id;
    private Integer orderId;
    private Integer userId;
    private String  targetType;   // RESTAURANT | GROCERY | PHARMACY | DELIVERY_PARTNER
    private Integer targetId;     // shop id or courier_id
    private Integer stars;        // 1–5
    private String  comment;      // nullable, max 300 chars
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Integer getTargetId() { return targetId; }
    public void setTargetId(Integer targetId) { this.targetId = targetId; }

    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
