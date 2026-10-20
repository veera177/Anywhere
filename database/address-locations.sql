USE anywhere;

-- ═══════════════════════════════════════════════════════════════════════════
-- ADDRESS LOCATIONS EXTENSION
-- Adds geocoded coordinates + address type + default flag to the addresses
-- table so a single saved address can be reused across Food / Grocery /
-- Medicine and (optionally) prefilled for Courier pickup.
-- Geocoding happens ONLY at save time; coordinates are never re-fetched.
-- ═══════════════════════════════════════════════════════════════════════════

DELIMITER $$

CREATE PROCEDURE add_address_column_if_missing(
    IN column_name_value VARCHAR(64),
    IN column_definition_value VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'addresses'
          AND COLUMN_NAME = column_name_value
    ) THEN
        SET @alter_sql = CONCAT('ALTER TABLE addresses ADD COLUMN ', column_definition_value);
        PREPARE alter_statement FROM @alter_sql;
        EXECUTE alter_statement;
        DEALLOCATE PREPARE alter_statement;
    END IF;
END$$

DELIMITER ;

CALL add_address_column_if_missing('latitude',    'latitude DECIMAL(10,7) NULL');
CALL add_address_column_if_missing('longitude',   'longitude DECIMAL(10,7) NULL');
CALL add_address_column_if_missing('address_type','address_type VARCHAR(30) NOT NULL DEFAULT ''HOME''');
CALL add_address_column_if_missing('is_default',  'is_default TINYINT(1) NOT NULL DEFAULT 0');

DROP PROCEDURE add_address_column_if_missing;

-- Ensure a user's default address is unique-ish by clearing extras (safe for small apps)
UPDATE addresses a
JOIN (
    SELECT user_id, MIN(id) AS keep_id
    FROM addresses
    WHERE is_default = 1
    GROUP BY user_id
) d ON a.user_id = d.user_id AND a.id <> d.keep_id
SET a.is_default = 0
WHERE a.is_default = 1;

DESC addresses;
