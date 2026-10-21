package com.app.start_app.rating;

import java.time.LocalDateTime;
import java.util.List;

/**
 * RatingSummary — response for GET /api/ratings/{targetType}/{targetId}.
 * Contains the aggregate stats plus the 10 most-recent rated comments.
 */
public class RatingSummary {

    private double        averageRating;
    private int           ratingCount;
    private List<Entry>   recentReviews;

    // ----------------------------------------------------------------
    // Nested entry (one review row)
    // ----------------------------------------------------------------
    public static class Entry {
        private Integer       stars;
        private String        comment;
        private LocalDateTime createdAt;

        public Entry(Integer stars, String comment, LocalDateTime createdAt) {
            this.stars     = stars;
            this.comment   = comment;
            this.createdAt = createdAt;
        }

        public Integer       getStars()     { return stars; }
        public String        getComment()   { return comment; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    // ----------------------------------------------------------------
    // Constructors / accessors
    // ----------------------------------------------------------------
    public RatingSummary() {}

    public RatingSummary(double averageRating, int ratingCount, List<Entry> recentReviews) {
        this.averageRating = averageRating;
        this.ratingCount   = ratingCount;
        this.recentReviews = recentReviews;
    }

    public double      getAverageRating()  { return averageRating; }
    public void        setAverageRating(double v) { this.averageRating = v; }

    public int         getRatingCount()    { return ratingCount; }
    public void        setRatingCount(int v) { this.ratingCount = v; }

    public List<Entry> getRecentReviews()  { return recentReviews; }
    public void        setRecentReviews(List<Entry> v) { this.recentReviews = v; }
}
