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

        String sql = """
                SELECT
                    gp.*,
                    gs.name AS store_name
                FROM grocery_products gp
                JOIN grocery_stores gs
                ON gp.store_id = gs.id
                WHERE (? IS NULL OR gp.district = ?)
                  AND (? IS NULL OR gp.store_id = ?)
                ORDER BY gp.rating DESC
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
                storeId,
                storeId
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
