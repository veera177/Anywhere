use anywhere;

-- 1. Create Grocery Stores Table
CREATE TABLE IF NOT EXISTS grocery_stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    district VARCHAR(100),
    rating DOUBLE,
    location VARCHAR(200),
    delivery_type VARCHAR(50)
);

-- 2. Create Grocery Products Table
CREATE TABLE IF NOT EXISTS grocery_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district VARCHAR(100),
    category VARCHAR(100),
    name VARCHAR(150),
    description TEXT,
    price DOUBLE,
    stock INT,
    rating DOUBLE DEFAULT 4.5,
    offer_tag VARCHAR(100),
    unit_type VARCHAR(50),
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    store_id INT,
    CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES grocery_stores(id)
);

-- 3. Seed Grocery Stores
INSERT INTO grocery_stores (id, name, district, rating, location, delivery_type) VALUES
(1, 'Salem Fresh Mart', 'salem', 4.6, 'Salem Junction', 'URBAN'),
(2, 'Trichy Organic Plaza', 'trichy', 4.5, 'Trichy Central', 'URBAN'),
(3, 'Thanjavur Grains Store', 'thanjavur', 4.4, 'Thanjavur Main', 'URBAN'),
(4, 'Theni Veggie Market', 'theni', 4.7, 'Theni Main', 'RURAL'),
(5, 'Kanyakumari Supermarket', 'kanyakumari', 4.5, 'Nagercoil', 'URBAN'),
(6, 'Karaikudi Spices Corner', 'karaikudi', 4.8, 'Karaikudi Main', 'RURAL'),
(7, 'Pollachi Coconut & Oils', 'pollachi', 4.6, 'Pollachi Town', 'RURAL'),
(8, 'Ooty Organic Greens', 'ooty', 4.9, 'Ooty Lake Road', 'URBAN'),
(9, 'Ambur Provision Store', 'ambur', 4.3, 'Ambur Bazaar', 'URBAN'),
(10, 'Tiruvannamalai Agro Mart', 'tiruvannamalai', 4.5, 'Temple Area', 'RURAL')
ON DUPLICATE KEY UPDATE name=VALUES(name), district=VALUES(district), rating=VALUES(rating), location=VALUES(location), delivery_type=VALUES(delivery_type);

-- 4. Seed Grocery Products
INSERT INTO grocery_products (id, district, category, name, description, price, stock, rating, offer_tag, unit_type, image_url, available, store_id) VALUES
-- Salem Fresh Mart
(1, 'salem', 'Fruits', 'Organic Apples', 'Fresh crunchy organic red apples', 180, 20, 4.6, 'Fresh Pick', '1 kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80', true, 1),
(2, 'salem', 'Vegetables', 'Fresh Carrots', 'Farm fresh sweet orange carrots', 60, 25, 4.5, 'Budget Friendly', '1 kg', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80', true, 1),
(3, 'salem', 'Dairy', 'Pure Cow Milk', 'Fresh raw unpasteurized cow milk', 50, 30, 4.8, 'Top Seller', '1 Litre', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80', true, 1),

-- Trichy Organic Plaza
(4, 'trichy', 'Staples', 'Basmati Rice', 'Premium long grain aged Basmati rice', 120, 15, 4.7, 'Premium Quality', '1 kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80', true, 2),
(5, 'trichy', 'Fruits', 'Fresh Bananas', 'Sweet ripe organic local bananas', 40, 40, 4.4, 'Freshly Sourced', '1 Dozen', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80', true, 2),
(6, 'trichy', 'Spices', 'Organic Turmeric Powder', 'Pure stone ground organic turmeric', 90, 22, 4.8, '100% Pure', '250g', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80', true, 2),

-- Thanjavur Grains Store
(7, 'thanjavur', 'Staples', 'Toor Dal', 'Premium quality split pigeon peas', 140, 18, 4.5, 'Everyday Choice', '1 kg', 'https://images.unsplash.com/photo-1585996767668-96f30a9179ef?auto=format&fit=crop&w=900&q=80', true, 3),
(8, 'thanjavur', 'Snacks', 'Roasted Cashews', 'Crunchy oven roasted salted cashews', 250, 10, 4.7, 'Premium Snack', '250g', 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=900&q=80', true, 3),

-- Theni Veggie Market
(9, 'theni', 'Vegetables', 'Country Tomatoes', 'Juicy farm fresh country tomatoes', 35, 50, 4.6, 'Farm Fresh', '1 kg', 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=900&q=80', true, 4),
(10, 'theni', 'Vegetables', 'Green Chillies', 'Hot and spicy fresh green chillies', 15, 30, 4.4, 'Local Crop', '250g', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80', true, 4),

-- Kanyakumari Supermarket
(11, 'kanyakumari', 'Fruits', 'Fresh Pineapples', 'Sweet and juicy coastal pineapples', 80, 15, 4.8, 'Bestseller', '1 unit', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=900&q=80', true, 5),
(12, 'kanyakumari', 'Snacks', 'Banana Chips', 'Traditional coconut oil fried chips', 70, 20, 4.7, 'Traditional Match', '200g', 'https://images.unsplash.com/photo-1627998794066-6a6006e8b248?auto=format&fit=crop&w=900&q=80', true, 5),

-- Karaikudi Spices Corner
(13, 'karaikudi', 'Spices', 'Black Pepper', 'Chettinad premium bold black pepper', 180, 12, 4.9, 'Aromatic Extra', '250g', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80', true, 6),
(14, 'karaikudi', 'Spices', 'Cardamom Pods', 'Premium green aromatic cardamom', 350, 8, 4.8, 'Export Quality', '100g', 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=900&q=80', true, 6),

-- Pollachi Coconut & Oils
(15, 'pollachi', 'Oils', 'Cold Pressed Coconut Oil', 'Pure wood-pressed coconut oil', 240, 20, 4.9, 'Pure Organic', '1 Litre', 'https://images.unsplash.com/photo-1590248238124-b2692b85b150?auto=format&fit=crop&w=900&q=80', true, 7),
(16, 'pollachi', 'Fruits', 'Tender Coconuts', 'Sweet hydrating fresh tender coconuts', 45, 35, 4.8, 'Refreshing', '1 unit', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80', true, 7),

-- Ooty Organic Greens
(17, 'ooty', 'Vegetables', 'Exotic Broccoli', 'Fresh handpicked exotic green broccoli', 110, 10, 4.8, 'Hill Station Special', '500g', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=900&q=80', true, 8),
(18, 'ooty', 'Fruits', 'Fresh Strawberries', 'Sweet and sour Ooty farm strawberries', 160, 12, 4.9, 'Top Quality', '250g', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80', true, 8),

-- Ambur Provision Store
(19, 'ambur', 'Staples', 'Atta Flour', '100% whole wheat stone ground flour', 75, 25, 4.4, 'Daily Essential', '1 kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', true, 9),
(20, 'ambur', 'Snacks', 'Butter Biscuits', 'Melt in mouth tea shop butter biscuits', 50, 30, 4.6, 'Tea Companion', '200g', 'https://images.unsplash.com/photo-1548940740-204726a19db3?auto=format&fit=crop&w=900&q=80', true, 9),

-- Tiruvannamalai Agro Mart
(21, 'tiruvannamalai', 'Dairy', 'Pure Ghee', 'Traditional organic cow ghee', 320, 14, 4.9, 'Pure Aroma', '500ml', 'https://images.unsplash.com/photo-1589733901241-5a55cd27f094?auto=format&fit=crop&w=900&q=80', true, 10),
(22, 'tiruvannamalai', 'Staples', 'Ragi Flour', 'Finger millet organic flour', 55, 20, 4.7, 'Healthy Choice', '1 kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', true, 10)
ON DUPLICATE KEY UPDATE district=VALUES(district), category=VALUES(category), name=VALUES(name), description=VALUES(description), price=VALUES(price), stock=VALUES(stock), rating=VALUES(rating), offer_tag=VALUES(offer_tag), unit_type=VALUES(unit_type), image_url=VALUES(image_url), available=VALUES(available), store_id=VALUES(store_id);

-- 5. Verify data
SELECT * FROM grocery_stores;
SELECT * FROM grocery_products;
