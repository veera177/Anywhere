USE anywhere;

CREATE TABLE IF NOT EXISTS platform_settings (
    setting_key VARCHAR(150) PRIMARY KEY,
    setting_value VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO platform_settings (setting_key, setting_value) VALUES
('district.default.tier', '2'),
('district.chennai.tier', '1'),
('district.coimbatore.tier', '1'),
('district.madurai.tier', '2'),
('district.tiruchirappalli.tier', '2'),
('district.trichy.tier', '2'),
('district.salem.tier', '2'),
('district.karaikudi.tier', '3'),

('delivery.food.radius_km', '20'),
('delivery.food.base_distance_km', '3'),
('delivery.food.first_band_limit_km', '8'),
('delivery.food.free_delivery_threshold', '199'),
('delivery.food.tier1.base_fee', '35'),
('delivery.food.tier1.first_band_rate', '7'),
('delivery.food.tier1.second_band_rate', '6'),
('delivery.food.tier1.max_fee', '100'),
('delivery.food.tier2.base_fee', '25'),
('delivery.food.tier2.first_band_rate', '6'),
('delivery.food.tier2.second_band_rate', '5'),
('delivery.food.tier2.max_fee', '80'),
('delivery.food.tier3.base_fee', '20'),
('delivery.food.tier3.first_band_rate', '5'),
('delivery.food.tier3.second_band_rate', '4'),
('delivery.food.tier3.max_fee', '65'),

('delivery.grocery.radius_km', '25'),
('delivery.grocery.base_distance_km', '3'),
('delivery.grocery.first_band_limit_km', '10'),
('delivery.grocery.free_delivery_threshold', '299'),
('delivery.grocery.tier1.base_fee', '28'),
('delivery.grocery.tier1.first_band_rate', '6'),
('delivery.grocery.tier1.second_band_rate', '5'),
('delivery.grocery.tier1.max_fee', '100'),
('delivery.grocery.tier2.base_fee', '22'),
('delivery.grocery.tier2.first_band_rate', '5'),
('delivery.grocery.tier2.second_band_rate', '4'),
('delivery.grocery.tier2.max_fee', '80'),
('delivery.grocery.tier3.base_fee', '18'),
('delivery.grocery.tier3.first_band_rate', '4'),
('delivery.grocery.tier3.second_band_rate', '3'),
('delivery.grocery.tier3.max_fee', '65'),

('delivery.medicine.radius_km', '25'),
('delivery.medicine.base_distance_km', '3'),
('delivery.medicine.first_band_limit_km', '10'),
('delivery.medicine.free_delivery_threshold', '149'),
('delivery.medicine.emergency_priority_surcharge', '15'),
('delivery.medicine.tier1.base_fee', '22'),
('delivery.medicine.tier1.first_band_rate', '5'),
('delivery.medicine.tier1.second_band_rate', '4'),
('delivery.medicine.tier1.max_fee', '80'),
('delivery.medicine.tier2.base_fee', '17'),
('delivery.medicine.tier2.first_band_rate', '4'),
('delivery.medicine.tier2.second_band_rate', '3'),
('delivery.medicine.tier2.max_fee', '65'),
('delivery.medicine.tier3.base_fee', '13'),
('delivery.medicine.tier3.first_band_rate', '3'),
('delivery.medicine.tier3.second_band_rate', '2'),
('delivery.medicine.tier3.max_fee', '55'),

('delivery.courier.radius_km', '30'),
('delivery.courier.base_distance_km', '3'),
('delivery.courier.first_band_limit_km', '10'),
('delivery.courier.free_delivery_threshold', '0'),
('delivery.courier.tier1.base_fee', '25'),
('delivery.courier.tier1.first_band_rate', '5'),
('delivery.courier.tier1.second_band_rate', '4'),
('delivery.courier.tier1.max_fee', '100'),
('delivery.courier.tier2.base_fee', '20'),
('delivery.courier.tier2.first_band_rate', '4'),
('delivery.courier.tier2.second_band_rate', '3'),
('delivery.courier.tier2.max_fee', '80'),
('delivery.courier.tier3.base_fee', '15'),
('delivery.courier.tier3.first_band_rate', '3'),
('delivery.courier.tier3.second_band_rate', '2'),
('delivery.courier.tier3.max_fee', '65'),

('settlement.food.commission_pct', '15'),
('settlement.grocery.commission_pct', '8'),
('settlement.medicine.commission_pct', '5'),
('settlement.commission_floor', '15'),
('settlement.courier.platform_fee_pct', '20'),
('settlement.courier.platform_floor', '15'),
('settlement.tier3.delivery_partner_topup_pct', '8'),
('first_order_free_delivery', 'false')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

DELIMITER $$

CREATE PROCEDURE add_order_column_if_missing(
    IN column_name_value VARCHAR(64),
    IN column_definition_value VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'orders'
          AND COLUMN_NAME = column_name_value
    ) THEN
        SET @alter_sql = CONCAT('ALTER TABLE orders ADD COLUMN ', column_definition_value);
        PREPARE alter_statement FROM @alter_sql;
        EXECUTE alter_statement;
        DEALLOCATE PREPARE alter_statement;
    END IF;
END$$

DELIMITER ;

CALL add_order_column_if_missing('product_total', 'product_total DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL add_order_column_if_missing('distance_km', 'distance_km DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL add_order_column_if_missing('delivery_fee_original', 'delivery_fee_original DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL add_order_column_if_missing('delivery_discount', 'delivery_discount DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL add_order_column_if_missing('final_delivery_fee', 'final_delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0');
CALL add_order_column_if_missing('delivery_eta_label', 'delivery_eta_label VARCHAR(50)');

DROP PROCEDURE add_order_column_if_missing;

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
);

DELIMITER $$

CREATE PROCEDURE add_settlement_column_if_missing(
    IN column_name_value VARCHAR(64),
    IN column_definition_value VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'settlements'
          AND COLUMN_NAME = column_name_value
    ) THEN
        SET @alter_sql = CONCAT('ALTER TABLE settlements ADD COLUMN ', column_definition_value);
        PREPARE alter_statement FROM @alter_sql;
        EXECUTE alter_statement;
        DEALLOCATE PREPARE alter_statement;
    END IF;
END$$

DELIMITER ;

CALL add_settlement_column_if_missing('partner_id', 'partner_id INT NULL AFTER order_id');
CALL add_settlement_column_if_missing('delivery_partner_id', 'delivery_partner_id INT NULL AFTER partner_id');
CALL add_settlement_column_if_missing('commission_amount', 'commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER product_total');
CALL add_settlement_column_if_missing('delivery_fee', 'delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER commission_amount');
CALL add_settlement_column_if_missing('delivery_partner_payout', 'delivery_partner_payout DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER partner_payout');
CALL add_settlement_column_if_missing('refund_amount', 'refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER platform_earning');
CALL add_settlement_column_if_missing('settlement_status', 'settlement_status VARCHAR(30) NOT NULL DEFAULT ''PENDING'' AFTER refund_amount');

DROP PROCEDURE add_settlement_column_if_missing;
