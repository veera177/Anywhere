package com.app.start_app.food;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FoodProductDAO {

    private final JdbcTemplate jdbcTemplate;

    public FoodProductDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET PRODUCTS
    public List<FoodProduct> getFoodProducts(String district) {
        return getFoodProducts(district, null);
    }

    public List<FoodProduct> getFoodProducts(String district, Integer restaurantId) {

        String sql = """
                SELECT
                    fp.*,
                    r.name AS restaurant_name
                FROM food_products fp
                JOIN restaurants r
                ON fp.restaurant_id = r.id
                WHERE (? IS NULL OR fp.district = ?)
                  AND (? IS NULL OR fp.restaurant_id = ?)
                ORDER BY fp.rating DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new FoodProduct(
                        rs.getInt("id"),
                        rs.getString("district"),
                        rs.getString("category"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("price"),
                        rs.getInt("stock"),
                        rs.getDouble("rating"),
                        rs.getString("offer_tag"),
                        rs.getString("food_type"),
                        rs.getString("image_url"),
                        rs.getBoolean("available"),
                        rs.getString("restaurant_name"),
                        rs.getObject("restaurant_id", Integer.class)
                ),
                district,
                district,
                restaurantId,
                restaurantId
        );
    }

    // REDUCE STOCK
    public void reduceStock(int productId) {

        String sql = """
                UPDATE food_products
                SET stock = stock - 1
                WHERE id = ?
                AND stock > 0
                """;

        jdbcTemplate.update(sql, productId);
    }
}
