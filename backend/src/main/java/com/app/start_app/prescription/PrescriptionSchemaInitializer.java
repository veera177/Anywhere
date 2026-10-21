package com.app.start_app.prescription;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Keeps the small JDBC project usable when a local database was created from
 * an older SQL script. Each change is guarded, so restarts never duplicate it.
 */
@Component
public class PrescriptionSchemaInitializer {
    private final JdbcTemplate jdbcTemplate;

    public PrescriptionSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensurePrescriptionColumns() {
        ensureDeliverySettings();
        ensureOrderColumns();
        if (!columnExists("medicine_products", "schedule_type")) {
            jdbcTemplate.execute("ALTER TABLE medicine_products "
                    + "ADD COLUMN schedule_type ENUM('OTC','SCHEDULE_H','SCHEDULE_H1') NOT NULL DEFAULT 'OTC'");
        }
        if (!columnExists("medicine_products", "requires_prescription")) {
            jdbcTemplate.execute("ALTER TABLE medicine_products "
                    + "ADD COLUMN requires_prescription BOOLEAN NOT NULL DEFAULT FALSE");
        }

        jdbcTemplate.update("UPDATE medicine_products SET schedule_type='SCHEDULE_H', requires_prescription=TRUE "
                        + "WHERE LOWER(name) REGEXP 'amoxicillin|azithromycin|metformin|amlodipine|telmisartan|gluconorm' "
                        + "OR LOWER(description) LIKE '%prescription required%' ");

        ensurePrescriptionTable();
        ensurePrescriptionColumn("order_id", "INT NULL");
        ensurePrescriptionColumn("cart_item_id", "INT NULL");
        ensurePrescriptionColumn("medicine_id", "INT NULL");
        ensurePrescriptionColumn("assigned_pharmacy_id", "INT NULL");
        ensurePrescriptionColumn("rejection_reason", "VARCHAR(255) NULL");
        ensurePrescriptionColumn("reviewed_by", "INT NULL");
        ensurePrescriptionColumn("valid_until", "DATE NULL");
        ensurePrescriptionColumn("uploaded_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        ensurePrescriptionColumn("reviewed_at", "TIMESTAMP NULL");
        jdbcTemplate.execute("ALTER TABLE prescriptions MODIFY COLUMN medicine_id INT NULL");
        jdbcTemplate.execute("ALTER TABLE prescriptions MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PENDING'");
    }

    private void ensureOrderColumns() {
        ensureColumn("orders", "tracking_status", "ALTER TABLE orders ADD COLUMN tracking_status VARCHAR(30) DEFAULT 'ORDER_PLACED'");
        ensureColumn("orders", "estimated_delivery_time", "ALTER TABLE orders ADD COLUMN estimated_delivery_time TIMESTAMP NULL");
        ensureColumn("orders", "product_total", "ALTER TABLE orders ADD COLUMN product_total DECIMAL(10,2) NOT NULL DEFAULT 0");
        ensureColumn("orders", "distance_km", "ALTER TABLE orders ADD COLUMN distance_km DECIMAL(10,2) NOT NULL DEFAULT 0");
        ensureColumn("orders", "delivery_fee_original", "ALTER TABLE orders ADD COLUMN delivery_fee_original DECIMAL(10,2) NOT NULL DEFAULT 0");
        ensureColumn("orders", "delivery_discount", "ALTER TABLE orders ADD COLUMN delivery_discount DECIMAL(10,2) NOT NULL DEFAULT 0");
        ensureColumn("orders", "final_delivery_fee", "ALTER TABLE orders ADD COLUMN final_delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0");
        ensureColumn("orders", "delivery_eta_label", "ALTER TABLE orders ADD COLUMN delivery_eta_label VARCHAR(50)");
    }

    private void ensurePrescriptionTable() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS prescriptions (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NULL,
                    cart_item_id INT NULL,
                    user_id INT NOT NULL,
                    medicine_id INT NULL,
                    assigned_pharmacy_id INT NULL,
                    file_url VARCHAR(500) NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                    rejection_reason VARCHAR(255) NULL,
                    reviewed_by INT NULL,
                    valid_until DATE NULL,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP NULL
                )
                """);
    }

    private void ensurePrescriptionColumn(String columnName, String definition) {
        ensureColumn("prescriptions", columnName,
                "ALTER TABLE prescriptions ADD COLUMN " + columnName + " " + definition);
    }

    private void ensureDeliverySettings() {
        ensureSetting("district.default.tier", "2");
        ensureSetting("district.chennai.tier", "1");
        ensureSetting("district.coimbatore.tier", "1");
        ensureSetting("district.madurai.tier", "2");
        ensureSetting("district.tiruchirappalli.tier", "2");
        ensureSetting("district.trichy.tier", "2");
        ensureSetting("district.salem.tier", "2");
        ensureSetting("district.karaikudi.tier", "3");

        ensureSetting("delivery.food.radius_km", "20");
        ensureSetting("delivery.food.base_distance_km", "3");
        ensureSetting("delivery.food.first_band_limit_km", "8");
        ensureSetting("delivery.food.free_delivery_threshold", "199");
        ensureSetting("delivery.food.tier1.base_fee", "35");
        ensureSetting("delivery.food.tier1.first_band_rate", "7");
        ensureSetting("delivery.food.tier1.second_band_rate", "6");
        ensureSetting("delivery.food.tier1.max_fee", "100");
        ensureSetting("delivery.food.tier2.base_fee", "25");
        ensureSetting("delivery.food.tier2.first_band_rate", "6");
        ensureSetting("delivery.food.tier2.second_band_rate", "5");
        ensureSetting("delivery.food.tier2.max_fee", "80");
        ensureSetting("delivery.food.tier3.base_fee", "20");
        ensureSetting("delivery.food.tier3.first_band_rate", "5");
        ensureSetting("delivery.food.tier3.second_band_rate", "4");
        ensureSetting("delivery.food.tier3.max_fee", "65");

        ensureSetting("delivery.grocery.radius_km", "25");
        ensureSetting("delivery.grocery.base_distance_km", "3");
        ensureSetting("delivery.grocery.first_band_limit_km", "10");
        ensureSetting("delivery.grocery.free_delivery_threshold", "299");
        ensureSetting("delivery.grocery.tier1.base_fee", "28");
        ensureSetting("delivery.grocery.tier1.first_band_rate", "6");
        ensureSetting("delivery.grocery.tier1.second_band_rate", "5");
        ensureSetting("delivery.grocery.tier1.max_fee", "100");
        ensureSetting("delivery.grocery.tier2.base_fee", "22");
        ensureSetting("delivery.grocery.tier2.first_band_rate", "5");
        ensureSetting("delivery.grocery.tier2.second_band_rate", "4");
        ensureSetting("delivery.grocery.tier2.max_fee", "80");
        ensureSetting("delivery.grocery.tier3.base_fee", "18");
        ensureSetting("delivery.grocery.tier3.first_band_rate", "4");
        ensureSetting("delivery.grocery.tier3.second_band_rate", "3");
        ensureSetting("delivery.grocery.tier3.max_fee", "65");

        ensureSetting("delivery.medicine.radius_km", "25");
        ensureSetting("delivery.medicine.base_distance_km", "3");
        ensureSetting("delivery.medicine.first_band_limit_km", "10");
        ensureSetting("delivery.medicine.free_delivery_threshold", "149");
        ensureSetting("delivery.medicine.emergency_priority_surcharge", "15");
        ensureSetting("delivery.medicine.tier1.base_fee", "22");
        ensureSetting("delivery.medicine.tier1.first_band_rate", "5");
        ensureSetting("delivery.medicine.tier1.second_band_rate", "4");
        ensureSetting("delivery.medicine.tier1.max_fee", "80");
        ensureSetting("delivery.medicine.tier2.base_fee", "17");
        ensureSetting("delivery.medicine.tier2.first_band_rate", "4");
        ensureSetting("delivery.medicine.tier2.second_band_rate", "3");
        ensureSetting("delivery.medicine.tier2.max_fee", "65");
        ensureSetting("delivery.medicine.tier3.base_fee", "13");
        ensureSetting("delivery.medicine.tier3.first_band_rate", "3");
        ensureSetting("delivery.medicine.tier3.second_band_rate", "2");
        ensureSetting("delivery.medicine.tier3.max_fee", "55");

        ensureSetting("delivery.courier.radius_km", "30");
        ensureSetting("delivery.courier.base_distance_km", "3");
        ensureSetting("delivery.courier.first_band_limit_km", "10");
        ensureSetting("delivery.courier.free_delivery_threshold", "0");
        ensureSetting("delivery.courier.tier1.base_fee", "25");
        ensureSetting("delivery.courier.tier1.first_band_rate", "5");
        ensureSetting("delivery.courier.tier1.second_band_rate", "4");
        ensureSetting("delivery.courier.tier1.max_fee", "100");
        ensureSetting("delivery.courier.tier2.base_fee", "20");
        ensureSetting("delivery.courier.tier2.first_band_rate", "4");
        ensureSetting("delivery.courier.tier2.second_band_rate", "3");
        ensureSetting("delivery.courier.tier2.max_fee", "80");
        ensureSetting("delivery.courier.tier3.base_fee", "15");
        ensureSetting("delivery.courier.tier3.first_band_rate", "3");
        ensureSetting("delivery.courier.tier3.second_band_rate", "2");
        ensureSetting("delivery.courier.tier3.max_fee", "65");

        ensureSetting("prescription.review_delay_seconds", "10");
        ensureSetting("prescription.max_file_size_mb", "5");
        ensureSetting("prescription.repeat_order_validity_days", "30");
        ensureSetting("prescription.rejection_reasons", "[\"Image too blurry to read\",\"Prescription expired\",\"Medicine mismatch\",\"Incomplete details\"]");
        ensureSetting("first_order_free_delivery", "false");
    }

    private void ensureSetting(String key, String value) {
        jdbcTemplate.update("""
                INSERT INTO platform_settings (setting_key, setting_value)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE setting_value = setting_value
                """, key, value);
    }

    private void ensureColumn(String tableName, String columnName, String alterSql) {
        if (!columnExists(tableName, columnName)) {
            jdbcTemplate.execute(alterSql);
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns "
                        + "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                Integer.class, tableName, columnName
        );
        return count != null && count > 0;
    }
}
