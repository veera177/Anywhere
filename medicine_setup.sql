use anywhere;

-- 1. Create Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    district VARCHAR(100),
    rating DOUBLE,
    location VARCHAR(200),
    delivery_type VARCHAR(50)
);

-- 2. Create Medicine Products Table
CREATE TABLE IF NOT EXISTS medicine_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district VARCHAR(100),
    category VARCHAR(100),
    name VARCHAR(150),
    description TEXT,
    price DOUBLE,
    stock INT,
    rating DOUBLE DEFAULT 4.5,
    offer_tag VARCHAR(100),
    dosage VARCHAR(50),
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    pharmacy_id INT,
    CONSTRAINT fk_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
);

-- 3. Seed Pharmacies
INSERT INTO pharmacies (id, name, district, rating, location, delivery_type) VALUES
(1, 'Salem Med Plus', 'salem', 4.7, 'Salem Junction', 'URBAN'),
(2, 'Trichy Apollo Pharmacy', 'trichy', 4.6, 'Trichy Central', 'URBAN'),
(3, 'Thanjavur Care Pharmacy', 'thanjavur', 4.5, 'Thanjavur Main', 'URBAN'),
(4, 'Theni Local Pharma', 'theni', 4.3, 'Theni Main', 'RURAL'),
(5, 'Kanyakumari Health Mart', 'kanyakumari', 4.6, 'Nagercoil', 'URBAN'),
(6, 'Karaikudi Pharmacy Corner', 'karaikudi', 4.7, 'Karaikudi Main', 'RURAL'),
(7, 'Pollachi Wellness Meds', 'pollachi', 4.5, 'Pollachi Town', 'RURAL'),
(8, 'Ooty Clinic Pharmacy', 'ooty', 4.8, 'Ooty Lake Road', 'URBAN'),
(9, 'Ambur Star Meds', 'ambur', 4.4, 'Ambur Bazaar', 'URBAN'),
(10, 'Tiruvannamalai Shiva Medicals', 'tiruvannamalai', 4.6, 'Temple Area', 'RURAL')
ON DUPLICATE KEY UPDATE name=VALUES(name), district=VALUES(district), rating=VALUES(rating), location=VALUES(location), delivery_type=VALUES(delivery_type);

-- 4. Seed Medicine Products
INSERT INTO medicine_products (id, district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id) VALUES
-- Salem Med Plus
(1, 'salem', 'Painkillers', 'Paracetamol Tablets', 'For fever and body pain relief', 20, 50, 4.8, 'Essential', '10 Tablets', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80', true, 1),
(2, 'salem', 'Cold & Cough', 'Cough Syrup', 'Soothes throat irritation and cough', 65, 30, 4.6, 'Popular', '100 ml', 'https://images.unsplash.com/photo-1550572017-edd951b5c40c?auto=format&fit=crop&w=900&q=80', true, 1),
(3, 'salem', 'Supplements', 'Vitamin C chewables', 'Immunity booster chewable tablets', 99, 45, 4.7, 'Daily Dose', '30 Tablets', 'https://images.unsplash.com/photo-1616679911721-fe6eec18fcd5?auto=format&fit=crop&w=900&q=80', true, 1),

-- Trichy Apollo Pharmacy
(4, 'trichy', 'Digestive', 'Antacid Gel', 'Instant relief from acidity and gas', 110, 25, 4.7, 'Fast Acting', '200 ml', 'https://images.unsplash.com/photo-1550572017-edd951b5c40c?auto=format&fit=crop&w=900&q=80', true, 2),
(5, 'trichy', 'Painkillers', 'Pain Relief Gel', 'Fast absorbing gel for muscle pain', 85, 28, 4.5, 'Quick Relief', '30g', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80', true, 2),

-- Thanjavur Care Pharmacy
(6, 'thanjavur', 'First Aid', 'Adhesive Bandages', 'Breathable sterile plastic bandages', 45, 100, 4.9, 'Essential', '20 Pack', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80', true, 3),
(7, 'thanjavur', 'Cold & Cough', 'Nasal Spray', 'Relieves blocked nose fast', 75, 20, 4.6, 'Bestseller', '10 ml', 'https://images.unsplash.com/photo-1550572017-edd951b5c40c?auto=format&fit=crop&w=900&q=80', true, 3),

-- Theni Local Pharma
(8, 'theni', 'Painkillers', 'Ibuprofen Tablets', 'Anti-inflammatory pain relief tablets', 35, 40, 4.5, 'Generic', '15 Tablets', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80', true, 4),
(9, 'theni', 'First Aid', 'Antiseptic Liquid', 'Effective germ-protection formula', 90, 30, 4.8, 'First Aid Box', '250 ml', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80', true, 4),

-- Kanyakumari Health Mart
(10, 'kanyakumari', 'Digestive', 'ORS Drink', 'Rehydration formula for energy recovery', 30, 60, 4.7, 'Refreshing', '200 ml', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80', true, 5),
(11, 'kanyakumari', 'Supplements', 'Calcium D3 Tabs', 'For strong bones and joints', 120, 35, 4.6, 'Daily Dose', '30 Tablets', 'https://images.unsplash.com/photo-1616679911721-fe6eec18fcd5?auto=format&fit=crop&w=900&q=80', true, 5),

-- Karaikudi Pharmacy Corner
(12, 'karaikudi', 'Supplements', 'Multivitamin Capsules', 'Complete daily nutrition and energy', 150, 40, 4.8, 'Top Seller', '30 Caps', 'https://images.unsplash.com/photo-1616679911721-fe6eec18fcd5?auto=format&fit=crop&w=900&q=80', true, 6),
(13, 'karaikudi', 'Skin Care', 'Moisturizing Cream', 'Soothing cream for dry skin conditions', 180, 15, 4.5, 'Dermatologist Tested', '100g', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80', true, 6),

-- Pollachi Wellness Meds
(14, 'pollachi', 'Digestive', 'Digestive Tablets', 'Improves digestion and relieves bloating', 40, 50, 4.6, 'Herbal Touch', '10 Tablets', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80', true, 7),
(15, 'pollachi', 'Skin Care', 'Antifungal Powder', 'Soothing relief from sweat rashes', 75, 22, 4.7, 'Cooling', '100g', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80', true, 7),

-- Ooty Clinic Pharmacy
(16, 'ooty', 'Cold & Cough', 'Throat Lozenges', 'Relieves sore throat irritation', 25, 80, 4.9, 'Instant Soothing', '10 Lozenges', 'https://images.unsplash.com/photo-1550572017-edd951b5c40c?auto=format&fit=crop&w=900&q=80', true, 8),
(17, 'ooty', 'First Aid', 'Vapor Rub', 'Eases breathing and chest congestion', 80, 25, 4.8, 'Popular Choice', '50g', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80', true, 8),

-- Ambur Star Meds
(18, 'ambur', 'Digestive', 'Enzyme Syrup', 'Boosts appetite and digestion', 95, 24, 4.4, 'Refreshing', '200 ml', 'https://images.unsplash.com/photo-1550572017-edd951b5c40c?auto=format&fit=crop&w=900&q=80', true, 9),
(19, 'ambur', 'Painkillers', 'Pain Relief Spray', 'Spray for instant muscle strain relief', 130, 18, 4.7, 'High Demand', '55 ml', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=900&q=80', true, 9),

-- Tiruvannamalai Shiva Medicals
(20, 'tiruvannamalai', 'First Aid', 'Antiseptic Ointment', 'Prevents infection in minor cuts', 55, 30, 4.7, 'Essential', '20g', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80', true, 10),
(21, 'tiruvannamalai', 'Supplements', 'Iron & Folic Acid', 'For healthy blood cells and energy', 140, 28, 4.8, 'Recommended', '30 Tablets', 'https://images.unsplash.com/photo-1616679911721-fe6eec18fcd5?auto=format&fit=crop&w=900&q=80', true, 10)
ON DUPLICATE KEY UPDATE district=VALUES(district), category=VALUES(category), name=VALUES(name), description=VALUES(description), price=VALUES(price), stock=VALUES(stock), rating=VALUES(rating), offer_tag=VALUES(offer_tag), dosage=VALUES(dosage), image_url=VALUES(image_url), available=VALUES(available), pharmacy_id=VALUES(pharmacy_id);
