USE anywhere;

-- Run once after medicine_products, users, and orders exist.
ALTER TABLE medicine_products
    ADD COLUMN IF NOT EXISTS schedule_type ENUM('OTC','SCHEDULE_H','SCHEDULE_H1') NOT NULL DEFAULT 'OTC',
    ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN NOT NULL DEFAULT FALSE;

-- Schedule X / narcotic-controlled medicines are intentionally excluded from
-- the catalog and are not modeled in this project.
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    cart_item_id INT NULL,
    user_id INT NOT NULL,
    medicine_id INT NOT NULL,
    assigned_pharmacy_id INT NULL,
    file_url VARCHAR(500) NOT NULL,
    status ENUM('PENDING','UPLOADED','UNDER_REVIEW','VERIFIED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255) NULL,
    reviewed_by INT NULL,
    valid_until DATE NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    CONSTRAINT fk_prescription_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_prescription_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescription_medicine FOREIGN KEY (medicine_id) REFERENCES medicine_products(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescription_pharmacy FOREIGN KEY (assigned_pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL
);

INSERT INTO platform_settings (setting_key, setting_value) VALUES
    ('prescription.review_delay_seconds', '10'),
    ('prescription.max_file_size_mb', '5'),
    ('prescription.repeat_order_validity_days', '30'),
    ('prescription.rejection_reasons', '["Image too blurry to read","Prescription expired","Medicine mismatch","Incomplete details"]')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Existing medicines are treated as OTC until classified by the shop.
-- Example classifications for future product maintenance:
UPDATE medicine_products
SET schedule_type='SCHEDULE_H', requires_prescription=TRUE
WHERE LOWER(name) REGEXP 'amoxicillin|azithromycin|metformin|amlodipine|telmisartan|gluconorm'
   OR LOWER(description) LIKE '%prescription required%';
