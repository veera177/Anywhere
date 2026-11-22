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
        return getFoodProducts(district, null, null);
    }

    public List<FoodProduct> getFoodProducts(String district, Integer restaurantId) {
        return getFoodProducts(district, restaurantId, null, null);
    }

    public List<FoodProduct> getFoodProducts(String district, Integer restaurantId, String name) {
        return getFoodProducts(district, restaurantId, name, null);
    }

    public List<FoodProduct> getFoodProducts(String district, Integer restaurantId, String name, Boolean inStock) {

        String sql = """
                SELECT
                    fp.*,
                    r.name AS restaurant_name
                FROM food_products fp
                JOIN restaurants r
                ON fp.restaurant_id = r.id
                WHERE (? IS NULL OR EXISTS (
                    SELECT 1
                    FROM districts d
                    WHERE (LOWER(d.code) = LOWER(?) OR LOWER(d.name) = LOWER(?))
                      AND (LOWER(fp.district) = LOWER(d.code)
                           OR LOWER(fp.district) = LOWER(d.name))
                ))
                  AND (? IS NULL OR fp.restaurant_id = ?)
                  AND (? IS NULL OR LOWER(fp.name) LIKE LOWER(?)
                       OR LOWER(fp.category) LIKE LOWER(?)
                       OR LOWER(r.name) LIKE LOWER(?))
                  AND (NOT ? OR fp.stock > 0)
                ORDER BY
                  CASE WHEN ? IS NULL THEN 0
                       WHEN LOWER(fp.name) = LOWER(?) THEN 0
                       WHEN LOWER(fp.name) LIKE LOWER(?) THEN 1
                       ELSE 2 END,
                  CASE WHEN fp.stock > 0 THEN 0 ELSE 1 END,
                  fp.rating DESC
                LIMIT 10
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
                district,
                restaurantId,
                restaurantId,
                name,
                name == null ? null : "%" + name + "%",
                name == null ? null : "%" + name + "%",
                name == null ? null : "%" + name + "%",
                Boolean.TRUE.equals(inStock),
                name,
                name,
                name == null ? null : name + "%"
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
