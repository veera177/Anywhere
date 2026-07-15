package com.app.start_app.cart;
import com.app.start_app.cart.CartItem;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CartDAO {

    private final JdbcTemplate jdbcTemplate;

    public CartDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add item to cart
    public String addToCart(Cart cart) {

        // Check if same product already exists for this service type
        String existingProductSql = """
            SELECT id, quantity
            FROM cart
            WHERE user_id = ?
            AND service_type = ?
            AND product_id = ?
            """;

        List<Cart> existingProducts = jdbcTemplate.query(
                existingProductSql,
                (rs, rowNum) -> {

                    Cart item = new Cart();

                    item.setId(rs.getInt("id"));
                    item.setQuantity(rs.getInt("quantity"));

                    return item;
                },
                cart.getUserId(),
                cart.getServiceType(),
                cart.getProductId()
        );

        // Product already exists → increase quantity
        if (!existingProducts.isEmpty()) {

            Cart item = existingProducts.get(0);

            String updateSql = """
                UPDATE cart
                SET quantity = ?
                WHERE id = ?
                """;

            jdbcTemplate.update(
                    updateSql,
                    item.getQuantity() + cart.getQuantity(),
                    item.getId()
            );

            return "QUANTITY_UPDATED";
        }

        // New product
        String insertSql = """
            INSERT INTO cart
            (user_id, service_type, product_id, quantity)
            VALUES (?, ?, ?, ?)
            """;

        jdbcTemplate.update(
                insertSql,
                cart.getUserId(),
                cart.getServiceType(),
                cart.getProductId(),
                cart.getQuantity()
        );

        return "ITEM_ADDED";
    }

    // Get all cart items of a user
    public List<CartItem> getCartByUser(Integer userId) {

        String sql = """
            SELECT
                c.id,
                c.product_id,
                c.service_type,
                c.quantity,

                COALESCE(f.name, gp.name, mp.name, c.product_name) AS name,
                COALESCE(f.price, gp.price, mp.price, c.price) AS price,
                COALESCE(f.rating, gp.rating, mp.rating, c.rating, 0) AS rating,
                COALESCE(f.image_url, gp.image_url, mp.image_url, c.image_url) AS image_url,
                COALESCE(r.name, gs.name, p.name, c.provider_name, 'Anywhere Courier') AS restaurant_name

            FROM cart c

            LEFT JOIN food_products f
                ON c.service_type = 'FOOD' AND c.product_id = f.id
            LEFT JOIN restaurants r
                ON f.restaurant_id = r.id
            LEFT JOIN grocery_products gp
                ON c.service_type = 'GROCERY' AND c.product_id = gp.id
            LEFT JOIN grocery_stores gs
                ON gp.store_id = gs.id
            LEFT JOIN medicine_products mp
                ON c.service_type = 'MEDICINE' AND c.product_id = mp.id
            LEFT JOIN pharmacies p
                ON mp.pharmacy_id = p.id

            WHERE c.user_id = ?

            ORDER BY c.added_at DESC
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    CartItem item = new CartItem();

                    item.setCartId(rs.getInt("id"));
                    item.setProductId(rs.getInt("product_id"));
                    item.setServiceType(rs.getString("service_type"));
                    item.setQuantity(rs.getInt("quantity"));

                    item.setProductName(rs.getString("name"));
                    item.setRestaurantName(rs.getString("restaurant_name"));
                    item.setImageUrl(rs.getString("image_url"));

                    item.setPrice(rs.getDouble("price"));
                    item.setRating(rs.getDouble("rating"));

                    return item;

                },
                userId
        );
    }
    
    // Update quantity
    public int updateQuantity(Integer cartId, Integer quantity) {

        String sql = """
                UPDATE cart
                SET quantity = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, quantity, cartId);
    }

    // Remove one item
    public int removeItem(Integer cartId) {

        String sql = """
                DELETE FROM cart
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, cartId);
    }

    // Clear user's cart
    public int clearCart(Integer userId) {

        String sql = """
                DELETE FROM cart
                WHERE user_id = ?
                """;

        return jdbcTemplate.update(sql, userId);
    }

    public int clearCartService(Integer userId, String serviceType) {
        String sql = """
                DELETE FROM cart
                WHERE user_id = ? AND service_type = ?
                """;

        return jdbcTemplate.update(sql, userId, serviceType);
    }
}
