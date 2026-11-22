package com.app.start_app.grocery;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class GroceryProductDAO {

    private final JdbcTemplate jdbcTemplate;

    public GroceryProductDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // GET GROCERY PRODUCTS
    public List<GroceryProduct> getGroceryProducts(String district, Integer storeId) {
        return getGroceryProducts(district, storeId, null, null);
    }

    public List<GroceryProduct> getGroceryProducts(String district, Integer storeId, String name) {
        return getGroceryProducts(district, storeId, name, null);
    }

    public List<GroceryProduct> getGroceryProducts(String district, Integer storeId, String name, Boolean inStock) {

        String sql = """
                SELECT
                    gp.*,
                    gs.name AS store_name
                FROM grocery_products gp
                JOIN grocery_stores gs
                ON gp.store_id = gs.id
                WHERE (? IS NULL OR EXISTS (
                    SELECT 1
                    FROM districts d
                    WHERE (LOWER(d.code) = LOWER(?) OR LOWER(d.name) = LOWER(?))
                      AND (LOWER(gp.district) = LOWER(d.code)
                           OR LOWER(gp.district) = LOWER(d.name))
                ))
                  AND (? IS NULL OR gp.store_id = ?)
                  AND (? IS NULL OR LOWER(gp.name) LIKE LOWER(?)
                       OR LOWER(gp.category) LIKE LOWER(?)
                       OR LOWER(gs.name) LIKE LOWER(?))
                  AND (NOT ? OR gp.stock > 0)
                ORDER BY
                  CASE WHEN ? IS NULL THEN 0
                       WHEN LOWER(gp.name) = LOWER(?) THEN 0
                       WHEN LOWER(gp.name) LIKE LOWER(?) THEN 1
                       ELSE 2 END,
                  CASE WHEN gp.stock > 0 THEN 0 ELSE 1 END,
                  gp.rating DESC
                LIMIT 10
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new GroceryProduct(
                        rs.getInt("id"),
                        rs.getString("district"),
                        rs.getString("category"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("price"),
                        rs.getInt("stock"),
                        rs.getDouble("rating"),
                        rs.getString("offer_tag"),
                        rs.getString("unit_type"),
                        rs.getString("image_url"),
                        rs.getBoolean("available"),
                        rs.getString("store_name"),
                        rs.getObject("store_id", Integer.class)
                ),
                district,
                district,
                district,
                storeId,
                storeId,
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
                UPDATE grocery_products
                SET stock = stock - 1
                WHERE id = ?
                AND stock > 0
                """;

        jdbcTemplate.update(sql, productId);
    }
}
