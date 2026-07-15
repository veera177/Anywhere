USE anywhere;
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    service_type ENUM(
        'FOOD',
        'GROCERY',
        'MEDICINE',
        'COURIER',
        'HOME_SERVICE',
        'AGRICULTURE'
    ) NOT NULL,

    product_id INT NOT NULL,

    quantity INT DEFAULT 1,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
SHOW TABLES;
DESC cart;
INSERT INTO cart (user_id, service_type, product_id, quantity)
VALUES
(1, 'FOOD', 3, 2),
(1, 'MEDICINE', 7, 1),
(1, 'GROCERY', 4, 5);
SELECT * FROM cart;
