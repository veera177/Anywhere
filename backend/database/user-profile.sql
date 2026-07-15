USE anywhere;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'CUSTOMER',
    address_line VARCHAR(255),
    landmark VARCHAR(150),
    district VARCHAR(100),
    town VARCHAR(100),
    area_type VARCHAR(20) DEFAULT 'URBAN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users
(full_name, email, phone, password, role, address_line, landmark, district, town, area_type)
VALUES
('Demo Customer', 'demo@gmail.com', '9876543210', '12345', 'CUSTOMER',
 '12 Anna Street', 'Near Bus Stand', 'chennai', 'T Nagar', 'URBAN');

SELECT * FROM users;