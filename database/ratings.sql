-- ============================================================
-- Ratings & Reviews Feature
-- ============================================================
-- Run this script once against the `anywhere` database.
-- It is idempotent: uses IF NOT EXISTS / IF NOT EXISTS guards.
-- ============================================================

USE anywhere;

-- ------------------------------------------------------------
-- 1. ratings table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id          INT          PRIMARY KEY AUTO_INCREMENT,
    order_id    INT          NOT NULL,
    user_id     INT          NOT NULL,
    target_type ENUM('RESTAURANT','GROCERY','PHARMACY','DELIVERY_PARTNER') NOT NULL,
    target_id   INT          NOT NULL,        -- shop id OR courier_id
    stars       TINYINT      NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment     VARCHAR(300) NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- One rating per order per target type (shop + partner separately)
    CONSTRAINT uq_order_target UNIQUE (order_id, target_type),

    CONSTRAINT fk_rating_order  FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_rating_user   FOREIGN KEY (user_id)  REFERENCES users(id)
);

-- ------------------------------------------------------------
-- 2. Add average_rating / rating_count to shop tables
--    (ALTER IGNORE handles the case where columns already exist
--     in older MySQL; for MySQL 8 we use IF NOT EXISTS)
-- ------------------------------------------------------------

-- restaurants
ALTER TABLE restaurants
    ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;

-- grocery_stores
ALTER TABLE grocery_stores
    ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;

-- pharmacies
ALTER TABLE pharmacies
    ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;

-- NOTE: The `rating` DOUBLE column already exists on all three tables
-- and will be used as the cached average_rating. rating_count is the
-- newly-added counter. The RatingDAO updates both on every new rating.
