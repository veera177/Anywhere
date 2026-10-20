package com.app.start_app.grocery;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class GroceryStoreDAO {

    private final JdbcTemplate jdbcTemplate;

    public GroceryStoreDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET GROCERY STORES
    public List<GroceryStore> getGroceryStores(String district) {

        String sql = """
                SELECT *
                FROM grocery_stores
                WHERE (? IS NULL OR LOWER(district) = LOWER(?))
                ORDER BY rating DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    GroceryStore store = new GroceryStore(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("district"),
                            rs.getDouble("rating"),
                            rs.getString("location"),
                            rs.getString("delivery_type")
                    );
                    try { store.setRatingCount(rs.getInt("rating_count")); } catch (Exception ignored) {}
                    store.setLatitude(rs.getObject("latitude", Double.class));
                    store.setLongitude(rs.getObject("longitude", Double.class));
                    return store;
                },
                district,
                district
        );
    }
}
