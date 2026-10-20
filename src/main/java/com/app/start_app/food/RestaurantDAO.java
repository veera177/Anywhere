package com.app.start_app.food;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RestaurantDAO {

    private final JdbcTemplate jdbcTemplate;

    public RestaurantDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET ALL RESTAURANTS
    public List<Restaurant> getRestaurants(String district) {

        String sql = """
                SELECT *
                FROM restaurants
                WHERE (? IS NULL OR LOWER(district) = LOWER(?))
                  AND (is_active IS NULL OR is_active = TRUE)
                ORDER BY rating DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Restaurant r = new Restaurant(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("district"),
                            rs.getDouble("rating"),
                            rs.getString("location"),
                            rs.getString("delivery_type"),
                            rs.getObject("latitude",  Double.class),
                            rs.getObject("longitude", Double.class),
                            rs.getString("taluk"),
                            rs.getString("pincode"),
                            rs.getObject("is_verified", Boolean.class),
                            rs.getObject("is_active",   Boolean.class)
                    );
                    try { r.setRatingCount(rs.getInt("rating_count")); } catch (Exception ignored) {}
                    return r;
                },
                district,
                district
        );
    }
}
