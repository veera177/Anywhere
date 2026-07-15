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
                WHERE (? IS NULL OR district = ?)
                ORDER BY rating DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new Restaurant(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("district"),
                        rs.getDouble("rating"),
                        rs.getString("location"),
                        rs.getString("delivery_type")
                ),
                district,
                district
        );
    }
}
