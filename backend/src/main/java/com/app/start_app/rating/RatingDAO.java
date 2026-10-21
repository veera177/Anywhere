package com.app.start_app.rating;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

/**
 * RatingDAO — all DB access for the ratings feature.
 * <p>
 * Strategy: after each new rating insert, update the cached
 * average_rating and rating_count on the shop table in one UPDATE.
 * DELIVERY_PARTNER ratings do NOT update a dedicated table; the
 * summary is always computed live from the ratings table.
 */
@Repository
public class RatingDAO {

    private final JdbcTemplate jdbcTemplate;

    public RatingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ------------------------------------------------------------------
    // Insert
    // ------------------------------------------------------------------

    /**
     * Insert a new rating row and return the generated id.
     */
    public Integer insert(Rating rating) {
        String sql = """
                INSERT INTO ratings (order_id, user_id, target_type, target_id, stars, comment)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, rating.getOrderId());
            ps.setInt(2, rating.getUserId());
            ps.setString(3, rating.getTargetType());
            ps.setInt(4, rating.getTargetId());
            ps.setInt(5, rating.getStars());
            ps.setString(6, rating.getComment());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    // ------------------------------------------------------------------
    // Duplicate guard
    // ------------------------------------------------------------------

    /**
     * Returns true if a rating already exists for this order + target type.
     * (DB unique key also guards this, but checking here allows a clean 409.)
     */
    public boolean existsRating(Integer orderId, String targetType) {
        String sql = "SELECT COUNT(*) FROM ratings WHERE order_id = ? AND target_type = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, orderId, targetType);
        return count != null && count > 0;
    }

    // ------------------------------------------------------------------
    // Update cached averages on shop tables
    // ------------------------------------------------------------------

    /**
     * Recompute and cache average_rating + rating_count on the appropriate
     * shop table after a new rating is inserted.
     * DELIVERY_PARTNER has no dedicated shop table — nothing to cache.
     */
    public void updateShopAverageRating(String targetType, Integer targetId) {
        String table = resolveShopTable(targetType);
        if (table == null) return; // DELIVERY_PARTNER — skip

        String sql = """
                UPDATE %s
                SET rating       = (SELECT ROUND(AVG(stars), 2) FROM ratings
                                    WHERE target_type = ? AND target_id = ?),
                    rating_count = (SELECT COUNT(*)              FROM ratings
                                    WHERE target_type = ? AND target_id = ?)
                WHERE id = ?
                """.formatted(table);

        jdbcTemplate.update(sql, targetType, targetId, targetType, targetId, targetId);
    }

    // ------------------------------------------------------------------
    // Summary query (GET endpoint)
    // ------------------------------------------------------------------

    /**
     * Returns aggregate stats + 10 most recent comments for a target.
     */
    public RatingSummary getSummary(String targetType, Integer targetId) {
        // Aggregate row
        String aggSql = """
                SELECT COALESCE(ROUND(AVG(stars), 2), 0) AS avg_rating,
                       COUNT(*) AS cnt
                FROM ratings
                WHERE target_type = ? AND target_id = ?
                """;
        double[] agg = new double[]{0, 0};
        jdbcTemplate.query(aggSql, rs -> {
            agg[0] = rs.getDouble("avg_rating");
            agg[1] = rs.getDouble("cnt");
        }, targetType, targetId);

        // Recent reviews (latest 10 that have a non-null comment)
        String reviewSql = """
                SELECT stars, comment, created_at
                FROM ratings
                WHERE target_type = ? AND target_id = ? AND comment IS NOT NULL AND comment <> ''
                ORDER BY created_at DESC
                LIMIT 10
                """;
        List<RatingSummary.Entry> entries = jdbcTemplate.query(reviewSql, (rs, rowNum) ->
                new RatingSummary.Entry(
                        rs.getInt("stars"),
                        rs.getString("comment"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                ), targetType, targetId);

        return new RatingSummary((double) agg[0], (int) agg[1], entries);
    }

    // ------------------------------------------------------------------
    // Helper: resolve shop table name from targetType
    // ------------------------------------------------------------------
    private String resolveShopTable(String targetType) {
        if (targetType == null) return null;
        return switch (targetType.toUpperCase()) {
            case "RESTAURANT"        -> "restaurants";
            case "GROCERY"           -> "grocery_stores";
            case "PHARMACY"          -> "pharmacies";
            default                  -> null; // DELIVERY_PARTNER
        };
    }
}
