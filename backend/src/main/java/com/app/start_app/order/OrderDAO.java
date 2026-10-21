package com.app.start_app.order;

import com.app.start_app.delivery.DeliveryFeeBreakdown;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class OrderDAO {

    private final JdbcTemplate jdbcTemplate;

    public OrderDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String getAddressSnapshot(Integer userId, Integer addressId) {
        String sql = """
                SELECT CONCAT(title, ': ', address, ', ', city, ', ', district, ' - ', pincode)
                FROM addresses
                WHERE id = ? AND user_id = ?
                """;
        List<String> addresses = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), addressId, userId);
        return addresses.isEmpty() ? null : addresses.get(0);
    }

    public String getProfileAddressSnapshot(Integer userId) {
        String sql = """
                SELECT CONCAT_WS(', ',
                    NULLIF(address_line, ''),
                    CASE WHEN landmark IS NULL OR landmark = '' THEN NULL
                         ELSE CONCAT('Near ', landmark) END,
                    NULLIF(town, ''),
                    NULLIF(district, '')
                )
                FROM users
                WHERE id = ?
                """;

        List<String> addresses = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), userId);
        return addresses.isEmpty() ? null : addresses.get(0);
    }

    public Integer insertOrder(CreateOrderRequest request, String deliveryAddress, BigDecimal productTotal, DeliveryFeeBreakdown deliveryFee) {
        LocalDateTime estimatedDelivery = LocalDateTime.now().plusMinutes(45);
        // Courier adds the additive Anywhere platform fee on top of the delivery fee;
        // other services keep platform fee at zero so their totals are unchanged.
        BigDecimal platformFee = deliveryFee.getPlatformFee() != null
                ? deliveryFee.getPlatformFee()
                : BigDecimal.ZERO;
        BigDecimal total = productTotal.add(deliveryFee.getFinalDeliveryFee()).add(platformFee);
        String sql = """
                INSERT INTO orders
                (user_id, address_id, delivery_address, payment_method, total_amount, status,
                 tracking_status, estimated_delivery_time, product_total, distance_km,
                 delivery_fee_original, delivery_discount, final_delivery_fee, delivery_eta_label)
                VALUES (?, ?, ?, ?, ?, 'ORDER_PLACED', 'ORDER_PLACED', ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, request.getUserId());
            if (request.getAddressId() == null) {
                statement.setNull(2, java.sql.Types.INTEGER);
            } else {
                statement.setInt(2, request.getAddressId());
            }
            statement.setString(3, deliveryAddress);
            statement.setString(4, request.getPaymentMethod());
            statement.setBigDecimal(5, total);
            statement.setTimestamp(6, Timestamp.valueOf(estimatedDelivery));
            statement.setBigDecimal(7, productTotal);
            statement.setBigDecimal(8, deliveryFee.getDistanceKm());
            statement.setBigDecimal(9, deliveryFee.getOriginalDeliveryFee());
            statement.setBigDecimal(10, deliveryFee.getDeliveryDiscount());
            statement.setBigDecimal(11, deliveryFee.getFinalDeliveryFee());
            statement.setString(12, deliveryFee.getEstimatedDeliveryTime());
            return statement;
        }, keyHolder);

        return keyHolder.getKey().intValue();
    }

    public void insertItem(Integer orderId, OrderItem item) {
        String sql = """
                INSERT INTO order_items
                (order_id, product_id, service_type, product_name, price, quantity, subtotal)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        jdbcTemplate.update(sql, orderId, item.getProductId(), item.getServiceType(),
                item.getProductName(), item.getPrice(), item.getQuantity(), subtotal);
    }

    public void clearCart(Integer userId) {
        jdbcTemplate.update("DELETE FROM cart WHERE user_id = ?", userId);
    }

    public void clearCartService(Integer userId, String serviceType) {
        jdbcTemplate.update(
                "DELETE FROM cart WHERE user_id = ? AND service_type = ?",
                userId,
                serviceType
        );
    }

    public List<Order> findByUserId(Integer userId) {
        String sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY ordered_at DESC";
        List<Order> orders = jdbcTemplate.query(sql, this::mapOrder, userId);
        orders.forEach(order -> order.setItems(findItems(order.getId())));
        return orders;
    }

    public Order findById(Integer orderId) {
        String sql = "SELECT * FROM orders WHERE id = ?";
        List<Order> orders = jdbcTemplate.query(sql, this::mapOrder, orderId);
        if (orders.isEmpty()) return null;
        Order order = orders.get(0);
        order.setItems(findItems(orderId));
        return order;
    }

    public OrderTrackingResponse findTrackingById(Integer orderId) {
        String sql = """
                SELECT id, tracking_status, estimated_delivery_time
                FROM orders
                WHERE id = ?
                """;
        List<OrderTrackingResponse> results = jdbcTemplate.query(sql, (rs, rowNum) -> {
            OrderTrackingResponse response = new OrderTrackingResponse();
            response.setOrderId(rs.getInt("id"));
            response.setTrackingStatus(rs.getString("tracking_status"));
            Timestamp eta = rs.getTimestamp("estimated_delivery_time");
            if (eta != null) {
                response.setEstimatedDeliveryTime(eta.toLocalDateTime());
            }
            return response;
        }, orderId);
        return results.isEmpty() ? null : results.get(0);
    }

    public int updateTrackingStatus(Integer orderId, String trackingStatus) {
        return jdbcTemplate.update(
                "UPDATE orders SET tracking_status = ?, status = ? WHERE id = ?",
                trackingStatus, trackingStatus, orderId
        );
    }

    public int updateStatus(Integer orderId, String status) {
        return jdbcTemplate.update(
                "UPDATE orders SET status = ?, tracking_status = ? WHERE id = ?",
                status, status, orderId
        );
    }

    private List<OrderItem> findItems(Integer orderId) {
        String sql = "SELECT * FROM order_items WHERE order_id = ? ORDER BY id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            OrderItem item = new OrderItem();
            item.setId(rs.getInt("id"));
            item.setOrderId(rs.getInt("order_id"));
            item.setProductId(rs.getInt("product_id"));
            item.setServiceType(rs.getString("service_type"));
            item.setProductName(rs.getString("product_name"));
            item.setPrice(rs.getBigDecimal("price"));
            item.setQuantity(rs.getInt("quantity"));
            item.setSubtotal(rs.getBigDecimal("subtotal"));
            return item;
        }, orderId);
    }

    /**
     * Re-add all items from a previous order into the user's cart.
     * Skips items that are no longer available/in stock.
     */
    public ReorderResult reorderItems(Integer orderId, Integer userId) {
        List<OrderItem> items = findItems(orderId);
        java.util.List<String> added = new java.util.ArrayList<>();
        java.util.List<String> unavailable = new java.util.ArrayList<>();

        for (OrderItem item : items) {
            if ("COURIER".equalsIgnoreCase(item.getServiceType())) continue;
            boolean inStock = checkStock(item.getProductId(), item.getServiceType());
            if (!inStock) {
                unavailable.add(item.getProductName());
                continue;
            }
            // Upsert into cart
            String upsertSql = """
                    INSERT INTO cart (user_id, service_type, product_id, quantity, added_at)
                    VALUES (?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), added_at = NOW()
                    """;
            jdbcTemplate.update(upsertSql, userId, item.getServiceType(), item.getProductId(), item.getQuantity());
            added.add(item.getProductName());
        }
        return new ReorderResult(added, unavailable);
    }

    private boolean checkStock(Integer productId, String serviceType) {
        try {
            String table = switch (serviceType.toUpperCase()) {
                case "GROCERY" -> "grocery_products";
                case "MEDICINE" -> "medicine_products";
                default -> "food_products";
            };
            Integer stock = jdbcTemplate.queryForObject(
                    "SELECT stock FROM " + table + " WHERE id = ? AND available = TRUE",
                    Integer.class, productId);
            return stock != null && stock > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private Order mapOrder(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Order order = new Order();
        order.setId(rs.getInt("id"));
        order.setUserId(rs.getInt("user_id"));
        order.setAddressId((Integer) rs.getObject("address_id"));
        order.setDeliveryAddress(rs.getString("delivery_address"));
        order.setPaymentMethod(rs.getString("payment_method"));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));
        order.setProductTotal(readBigDecimal(rs, "product_total"));
        order.setDistanceKm(readBigDecimal(rs, "distance_km"));
        order.setDeliveryFeeOriginal(readBigDecimal(rs, "delivery_fee_original"));
        order.setDeliveryDiscount(readBigDecimal(rs, "delivery_discount"));
        order.setFinalDeliveryFee(readBigDecimal(rs, "final_delivery_fee"));
        order.setDeliveryEtaLabel(readString(rs, "delivery_eta_label"));
        order.setStatus(rs.getString("status"));
        order.setTrackingStatus(rs.getString("tracking_status"));
        Timestamp eta = rs.getTimestamp("estimated_delivery_time");
        if (eta != null) {
            order.setEstimatedDeliveryTime(eta.toLocalDateTime());
        }
        order.setOrderedAt(rs.getTimestamp("ordered_at").toLocalDateTime());
        return order;
    }

    private BigDecimal readBigDecimal(java.sql.ResultSet rs, String column) {
        try {
            return rs.getBigDecimal(column);
        } catch (java.sql.SQLException exception) {
            return BigDecimal.ZERO;
        }
    }

    private String readString(java.sql.ResultSet rs, String column) {
        try {
            return rs.getString(column);
        } catch (java.sql.SQLException exception) {
            return null;
        }
    }
}
