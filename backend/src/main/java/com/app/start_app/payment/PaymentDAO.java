package com.app.start_app.payment;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class PaymentDAO {

    private final JdbcTemplate jdbcTemplate;

    public PaymentDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Integer insert(Payment payment) {
        String sql = """
                INSERT INTO payments
                (order_id, user_id, payment_method, transaction_id, amount, payment_status)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, payment.getOrderId());
            statement.setInt(2, payment.getUserId());
            statement.setString(3, payment.getPaymentMethod());
            statement.setString(4, payment.getTransactionId());
            statement.setBigDecimal(5, payment.getAmount());
            statement.setString(6, payment.getPaymentStatus());
            return statement;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public Payment findById(Integer paymentId) {
        String sql = "SELECT * FROM payments WHERE id = ?";
        List<Payment> payments = jdbcTemplate.query(sql, this::mapPayment, paymentId);
        return payments.isEmpty() ? null : payments.get(0);
    }

    public Payment findByOrderId(Integer orderId) {
        String sql = "SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1";
        List<Payment> payments = jdbcTemplate.query(sql, this::mapPayment, orderId);
        return payments.isEmpty() ? null : payments.get(0);
    }

    public List<Payment> findByUserId(Integer userId) {
        String sql = "SELECT * FROM payments WHERE user_id = ? ORDER BY payment_time DESC";
        return jdbcTemplate.query(sql, this::mapPayment, userId);
    }

    public int updateStatus(Integer paymentId, String transactionId, String status) {
        return jdbcTemplate.update(
                "UPDATE payments SET transaction_id = ?, payment_status = ?, payment_time = CURRENT_TIMESTAMP WHERE id = ?",
                transactionId, status, paymentId
        );
    }

    public int updateOrderStatus(Integer orderId, String status) {
        return jdbcTemplate.update(
                "UPDATE orders SET status = ?, tracking_status = ? WHERE id = ?",
                status, status, orderId
        );
    }

    private Payment mapPayment(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Payment payment = new Payment();
        payment.setId(rs.getInt("id"));
        payment.setOrderId(rs.getInt("order_id"));
        payment.setUserId(rs.getInt("user_id"));
        payment.setPaymentMethod(rs.getString("payment_method"));
        payment.setTransactionId(rs.getString("transaction_id"));
        payment.setAmount(rs.getBigDecimal("amount"));
        payment.setPaymentStatus(rs.getString("payment_status"));
        Timestamp paymentTime = rs.getTimestamp("payment_time");
        if (paymentTime != null) {
            payment.setPaymentTime(paymentTime.toLocalDateTime());
        }
        return payment;
    }
}
