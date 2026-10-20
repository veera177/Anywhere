package com.app.start_app.settlement;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class SettlementDAO {

    private final JdbcTemplate jdbcTemplate;

    public SettlementDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createTableIfNotExists() {
        String sql = """
            CREATE TABLE IF NOT EXISTS settlements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                partner_id INT NULL,
                delivery_partner_id INT NULL,
                product_total DECIMAL(10,2) NOT NULL,
                commission_amount DECIMAL(10,2) NOT NULL,
                delivery_fee DECIMAL(10,2) NOT NULL,
                partner_payout DECIMAL(10,2) NOT NULL,
                delivery_partner_payout DECIMAL(10,2) NOT NULL,
                platform_earning DECIMAL(10,2) NOT NULL,
                refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                settlement_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """;
        jdbcTemplate.execute(sql);
        addMissingColumns();
    }

    public Integer insertSettlement(Settlement settlement) {
        String sql = """
            INSERT INTO settlements 
            (order_id, partner_id, delivery_partner_id, product_total, commission_amount, delivery_fee,
             partner_payout, delivery_partner_payout, platform_earning, refund_amount, settlement_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, settlement.getOrderId());
            setNullableInt(ps, 2, settlement.getPartnerId());
            setNullableInt(ps, 3, settlement.getDeliveryPartnerId());
            ps.setBigDecimal(4, settlement.getProductTotal());
            ps.setBigDecimal(5, settlement.getCommissionAmount());
            ps.setBigDecimal(6, settlement.getDeliveryFee());
            ps.setBigDecimal(7, settlement.getPartnerPayout());
            ps.setBigDecimal(8, settlement.getDeliveryPartnerPayout());
            ps.setBigDecimal(9, settlement.getPlatformEarning());
            ps.setBigDecimal(10, settlement.getRefundAmount());
            ps.setString(11, settlement.getSettlementStatus());
            return ps;
        }, keyHolder);
        
        return keyHolder.getKey() != null ? keyHolder.getKey().intValue() : null;
    }

    private void addMissingColumns() {
        Set<String> columns = jdbcTemplate.queryForList("SHOW COLUMNS FROM settlements")
                .stream()
                .map(row -> String.valueOf(row.get("Field")).toLowerCase())
                .collect(Collectors.toSet());

        addColumnIfMissing(columns, "partner_id", "ALTER TABLE settlements ADD COLUMN partner_id INT NULL AFTER order_id");
        addColumnIfMissing(columns, "delivery_partner_id", "ALTER TABLE settlements ADD COLUMN delivery_partner_id INT NULL AFTER partner_id");
        addColumnIfMissing(columns, "commission_amount", "ALTER TABLE settlements ADD COLUMN commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER product_total");
        addColumnIfMissing(columns, "delivery_fee", "ALTER TABLE settlements ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER commission_amount");
        addColumnIfMissing(columns, "delivery_partner_payout", "ALTER TABLE settlements ADD COLUMN delivery_partner_payout DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER partner_payout");
        addColumnIfMissing(columns, "refund_amount", "ALTER TABLE settlements ADD COLUMN refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER platform_earning");
        addColumnIfMissing(columns, "settlement_status", "ALTER TABLE settlements ADD COLUMN settlement_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' AFTER refund_amount");
    }

    private void addColumnIfMissing(Set<String> columns, String column, String sql) {
        if (!columns.contains(column)) {
            jdbcTemplate.execute(sql);
        }
    }

    private void setNullableInt(PreparedStatement ps, int index, Integer value) throws java.sql.SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.INTEGER);
        } else {
            ps.setInt(index, value);
        }
    }
}
