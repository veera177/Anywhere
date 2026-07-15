USE anywhere;

DROP TABLE IF EXISTS medicine_products;
DROP TABLE IF EXISTS pharmacies;

CREATE TABLE pharmacies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    district VARCHAR(100),
    rating DOUBLE,
    location VARCHAR(200),
    delivery_type VARCHAR(50)
);

CREATE TABLE medicine_products (
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
    CONSTRAINT fk_pharmacy
        FOREIGN KEY (pharmacy_id)
        REFERENCES pharmacies(id)
        ON DELETE CASCADE
);

INSERT INTO pharmacies
(id, name, district, rating, location, delivery_type)
VALUES
(1, 'Apollo Care Pharmacy', 'salem', 4.7, 'Salem Junction', 'URBAN'),
(2, 'MedPlus Health Store', 'trichy', 4.6, 'Trichy Central', 'URBAN'),
(3, 'Thanjavur Wellness Pharmacy', 'thanjavur', 4.5, 'Thanjavur Main Road', 'URBAN'),
(4, 'Green Life Medicals', 'theni', 4.6, 'Theni Bus Stand', 'RURAL'),
(5, 'Nagercoil Health Point', 'kanyakumari', 4.7, 'Nagercoil Market', 'URBAN'),
(6, 'Karaikudi Cure Pharmacy', 'karaikudi', 4.8, 'Karaikudi Main', 'RURAL'),
(7, 'Pollachi Family Medicals', 'pollachi', 4.5, 'Pollachi Town', 'RURAL'),
(8, 'Ooty Hill Pharmacy', 'ooty', 4.9, 'Ooty Lake Road', 'URBAN'),
(9, 'Ambur Med Care', 'ambur', 4.4, 'Ambur Bazaar', 'URBAN'),
(10, 'Arunachala Medical Store', 'tiruvannamalai', 4.6, 'Temple Area', 'RURAL'),
(11, 'Chennai Quick Meds', 'chennai', 4.8, 'T Nagar', 'URBAN'),
(12, 'Coimbatore Health Hub', 'coimbatore', 4.7, 'Gandhipuram', 'URBAN');

INSERT INTO medicine_products
(id, district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id)
VALUES
(1, 'salem', 'Fever', 'Paracetamol 500mg', 'Used for fever and mild pain relief', 25, 50, 4.7, 'Common Medicine', '500mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 1),
(2, 'salem', 'Cold', 'Cetirizine 10mg', 'Used for allergy, cold and sneezing', 18, 45, 4.5, 'Fast Relief', '10mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 1),
(3, 'salem', 'Pain Relief', 'Ibuprofen 400mg', 'Pain relief tablet for body pain', 32, 35, 4.4, 'Pain Care', '400mg', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 1),

(4, 'trichy', 'Acidity', 'Pantoprazole 40mg', 'Used for acidity and gastric issues', 42, 40, 4.6, 'Stomach Care', '40mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 2),
(5, 'trichy', 'Antibiotic', 'Amoxicillin 500mg', 'Antibiotic medicine, use only with doctor advice', 85, 30, 4.5, 'Doctor Advice', '500mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 2),
(6, 'trichy', 'Cough', 'Cough Relief Syrup', 'Syrup for dry cough and throat irritation', 95, 25, 4.4, 'Cough Care', '100ml', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 2),

(7, 'thanjavur', 'Diabetes', 'Metformin 500mg', 'Tablet for blood sugar control', 55, 35, 4.6, 'Diabetes Care', '500mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 3),
(8, 'thanjavur', 'BP Care', 'Amlodipine 5mg', 'Tablet for blood pressure control', 48, 30, 4.5, 'BP Care', '5mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 3),
(9, 'thanjavur', 'Vitamins', 'Vitamin C Tablets', 'Immunity support vitamin tablets', 75, 45, 4.7, 'Immunity Boost', '500mg', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 3),

(10, 'theni', 'Fever', 'Dolo 650mg', 'Fever and pain relief tablet', 30, 50, 4.8, 'Popular', '650mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 4),
(11, 'theni', 'First Aid', 'Antiseptic Cream', 'Cream for small cuts and wounds', 60, 20, 4.5, 'First Aid', '30g', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 4),
(12, 'theni', 'Oral Care', 'ORS Sachet', 'Oral rehydration salt for dehydration', 15, 60, 4.6, 'Essential', '21g', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 4),

(13, 'kanyakumari', 'Cold', 'Sinarest Tablet', 'Cold, headache and nasal relief tablet', 45, 35, 4.5, 'Cold Relief', 'Strip', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 5),
(14, 'kanyakumari', 'Skin Care', 'Calamine Lotion', 'Lotion for skin irritation', 80, 18, 4.4, 'Skin Care', '100ml', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 5),
(15, 'kanyakumari', 'Vitamins', 'Multivitamin Tablets', 'Daily vitamin supplement tablets', 120, 30, 4.7, 'Health Boost', 'Strip', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 5),

(16, 'karaikudi', 'Pain Relief', 'Diclofenac Gel', 'Gel for muscle and joint pain', 95, 22, 4.6, 'Pain Relief', '30g', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 6),
(17, 'karaikudi', 'Digestive', 'Digene Tablets', 'Tablet for acidity and indigestion', 35, 40, 4.5, 'Digestive Care', 'Strip', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 6),
(18, 'karaikudi', 'Fever', 'Calpol 500mg', 'Fever relief tablet', 28, 45, 4.6, 'Fever Care', '500mg', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 6),

(19, 'pollachi', 'Baby Care', 'Baby Fever Drops', 'Fever drops for children, use with doctor advice', 65, 20, 4.4, 'Baby Care', '15ml', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 7),
(20, 'pollachi', 'First Aid', 'Bandage Roll', 'Cotton bandage roll for first aid', 40, 50, 4.5, 'First Aid', '1 Roll', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 7),
(21, 'pollachi', 'Antiseptic', 'Betadine Solution', 'Antiseptic solution for wound cleaning', 75, 25, 4.7, 'Wound Care', '100ml', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 7),

(22, 'ooty', 'Cold', 'Vicks Vaporub', 'Relief balm for cold and blocked nose', 55, 40, 4.8, 'Winter Care', '25ml', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 8),
(23, 'ooty', 'Cough', 'Benadryl Cough Syrup', 'Cough syrup for throat irritation', 110, 20, 4.5, 'Cough Care', '100ml', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 8),
(24, 'ooty', 'Pain Relief', 'Moov Spray', 'Pain relief spray for muscle pain', 145, 18, 4.6, 'Pain Relief', '80g', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 8),

(25, 'ambur', 'Fever', 'Paracetamol 650mg', 'Fever relief tablet', 35, 45, 4.7, 'Essential', '650mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 9),
(26, 'ambur', 'Vitamins', 'Zinc Tablets', 'Zinc supplement for immunity support', 90, 25, 4.5, 'Immunity', '50mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 9),
(27, 'ambur', 'Digestive', 'Eno Sachet', 'Quick acidity relief sachet', 12, 70, 4.6, 'Quick Relief', '5g', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 9),

(28, 'tiruvannamalai', 'First Aid', 'Cotton Roll', 'Medical cotton roll for first aid', 45, 40, 4.4, 'First Aid', '100g', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 10),
(29, 'tiruvannamalai', 'Skin Care', 'Clotrimazole Cream', 'Antifungal skin cream, use with advice', 70, 20, 4.5, 'Skin Care', '15g', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 10),
(30, 'tiruvannamalai', 'Pain Relief', 'Aspirin 75mg', 'Pain relief tablet, use with doctor advice', 30, 28, 4.3, 'Doctor Advice', '75mg', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 10),

(31, 'chennai', 'Diabetes', 'Gluconorm 500mg', 'Tablet for diabetes care', 65, 35, 4.7, 'Diabetes Care', '500mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 11),
(32, 'chennai', 'BP Care', 'Telmisartan 40mg', 'Blood pressure control tablet', 85, 30, 4.6, 'BP Care', '40mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 11),
(33, 'chennai', 'Vitamins', 'Vitamin D3 Tablets', 'Vitamin D supplement tablets', 110, 25, 4.7, 'Bone Health', '60K IU', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 11),

(34, 'coimbatore', 'Fever', 'Crocin Advance', 'Fever and headache relief tablet', 38, 45, 4.7, 'Fast Relief', '500mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', true, 12),
(35, 'coimbatore', 'Cold', 'Levocetirizine 5mg', 'Allergy and cold relief tablet', 22, 40, 4.5, 'Allergy Care', '5mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', true, 12),
(36, 'coimbatore', 'First Aid', 'Digital Thermometer', 'Thermometer for checking body temperature', 180, 15, 4.8, 'Health Device', '1 Unit', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', true, 12);

SELECT * FROM pharmacies;
SELECT * FROM medicine_products;