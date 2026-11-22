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

    // Existing stock for a product, read from the product table of its service.
    // Returns null for services without a stock column (e.g. COURIER).
    private Integer getAvailableStock(String serviceType, Integer productId) {

        String sql;

        switch (serviceType == null ? "" : serviceType.toUpperCase()) {
            case "FOOD":
                sql = "SELECT stock FROM food_products WHERE id = ?";
                break;
            case "GROCERY":
                sql = "SELECT stock FROM grocery_products WHERE id = ?";
                break;
            case "MEDICINE":
                sql = "SELECT stock FROM medicine_products WHERE id = ?";
                break;
            default:
                return null;
        }

        List<Integer> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getInt("stock"), productId);

        return rows.isEmpty() ? null : rows.get(0);
    }

    // District of the shop that sells the product, read from the provider table.
    // Returns null for services without a shop (e.g. COURIER).
    public String getShopDistrict(String serviceType, Integer productId) {

        if (productId == null) return null;

        String sql;

        switch (serviceType == null ? "" : serviceType.toUpperCase()) {
            case "FOOD":
                sql = "SELECT r.district FROM food_products p JOIN restaurants r ON p.restaurant_id = r.id WHERE p.id = ?";
                break;
            case "GROCERY":
                sql = "SELECT s.district FROM grocery_products p JOIN grocery_stores s ON p.store_id = s.id WHERE p.id = ?";
                break;
            case "MEDICINE":
                sql = "SELECT ph.district FROM medicine_products p JOIN pharmacies ph ON p.pharmacy_id = ph.id WHERE p.id = ?";
                break;
            default:
                return null;
        }

        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("district"), productId);

        return rows.isEmpty() ? null : rows.get(0);
    }

    // Add item to cart
    public String addToCart(Cart cart) {

        // Never add a product that has no stock left
        Integer available = getAvailableStock(cart.getServiceType(), cart.getProductId());

        if (available != null && available <= 0) {
            return "OUT_OF_STOCK";
        }

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

    // Get all cart items of a user — joins correct product tables per service type
    public List<CartItem> getCartByUser(Integer userId) {

        // Use UNION to cleanly join the right product + provider table per service.
        // This avoids referencing non-existent columns in the cart table.
        String sql = """
            SELECT id, product_id, service_type, quantity,
                   name, price, rating, image_url, restaurant_name,
                   schedule_type, requires_prescription, stock, district, shop_latitude, shop_longitude
            FROM (
                SELECT c.id, c.product_id, c.service_type, c.quantity,
                       f.name, f.price, f.rating, f.image_url,
                       r.name AS restaurant_name,
                       NULL AS schedule_type,
                       FALSE AS requires_prescription,
                       f.stock,
                       f.district, r.latitude AS shop_latitude, r.longitude AS shop_longitude
                FROM cart c
                JOIN food_products f ON c.product_id = f.id
                LEFT JOIN restaurants r ON f.restaurant_id = r.id
                WHERE c.user_id = ? AND c.service_type = 'FOOD'

                UNION ALL

                SELECT c.id, c.product_id, c.service_type, c.quantity,
                       gp.name, gp.price, gp.rating, gp.image_url,
                       gs.name AS restaurant_name,
                       NULL AS schedule_type,
                       FALSE AS requires_prescription,
                       gp.stock,
                       gp.district, gs.latitude, gs.longitude
                FROM cart c
                JOIN grocery_products gp ON c.product_id = gp.id
                LEFT JOIN grocery_stores gs ON gp.store_id = gs.id
                WHERE c.user_id = ? AND c.service_type = 'GROCERY'

                UNION ALL

                SELECT c.id, c.product_id, c.service_type, c.quantity,
                       mp.name, mp.price, mp.rating, mp.image_url,
                       p.name AS restaurant_name,
                       mp.schedule_type,
                       COALESCE(mp.requires_prescription, FALSE) AS requires_prescription,
                       mp.stock,
                       mp.district, p.latitude, p.longitude
                FROM cart c
                JOIN medicine_products mp ON c.product_id = mp.id
                LEFT JOIN pharmacies p ON mp.pharmacy_id = p.id
                WHERE c.user_id = ? AND c.service_type = 'MEDICINE'

                UNION ALL

                SELECT c.id, c.product_id, c.service_type, c.quantity,
                       COALESCE(NULL, 'Courier Item') AS name,
                       0.0 AS price,
                       0.0 AS rating,
                       NULL AS image_url,
                       'Anywhere Courier' AS restaurant_name,
                       NULL AS schedule_type,
                       FALSE AS requires_prescription,
                       NULL AS stock,
                       NULL AS district, NULL AS shop_latitude, NULL AS shop_longitude
                FROM cart c
                WHERE c.user_id = ? AND c.service_type = 'COURIER'
            ) combined
            ORDER BY id DESC
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
                    item.setScheduleType(rs.getString("schedule_type"));
                    item.setRequiresPrescription(rs.getBoolean("requires_prescription"));
                    item.setStock(rs.getObject("stock", Integer.class));
                    item.setDistrict(rs.getString("district"));
                    item.setShopLatitude(rs.getObject("shop_latitude", Double.class));
                    item.setShopLongitude(rs.getObject("shop_longitude", Double.class));

                    return item;

                },
                userId, userId, userId, userId
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

    public Integer findOwner(Integer cartId) {
        List<Integer> owners = jdbcTemplate.queryForList("SELECT user_id FROM cart WHERE id = ?", Integer.class, cartId);
        return owners.isEmpty() ? null : owners.get(0);
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
