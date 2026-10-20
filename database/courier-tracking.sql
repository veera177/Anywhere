-- Courier tracking tables
-- Enables courier route creation, location tracking, and route lifecycle.

CREATE TABLE IF NOT EXISTS courier_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    courier_id INT NULL,
    order_id BIGINT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    pickup_latitude DECIMAL(10,7) NOT NULL,
    pickup_longitude DECIMAL(10,7) NOT NULL,
    delivery_latitude DECIMAL(10,7) NOT NULL,
    delivery_longitude DECIMAL(10,7) NOT NULL,
    pickup_address VARCHAR(255),
    delivery_address VARCHAR(255),
    map_url TEXT,
    estimated_duration_minutes INT NOT NULL DEFAULT 0,
    actual_duration_minutes INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS route_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    location_type VARCHAR(20) NOT NULL,
    location_name VARCHAR(255),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    address VARCHAR(255),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    distance_from_previous DECIMAL(10,2) NULL,
    arrival_time TIMESTAMP NULL,
    completion_time TIMESTAMP NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_route_locations_route FOREIGN KEY (route_id) REFERENCES courier_routes(id) ON DELETE CASCADE
);