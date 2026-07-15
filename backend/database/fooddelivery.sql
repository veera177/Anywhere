use anywhere;


CREATE TABLE restaurants (

    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150),

    district VARCHAR(100),

    rating DOUBLE,

    location VARCHAR(200),

    delivery_type VARCHAR(50)
);
CREATE TABLE food_products (
    id INT PRIMARY KEY AUTO_INCREMENT,

    district VARCHAR(100),

    category VARCHAR(100),

    name VARCHAR(150),

    description TEXT,

    price DOUBLE,

    stock INT,

    rating DOUBLE DEFAULT 4.5,

    offer_tag VARCHAR(100),

    food_type VARCHAR(50),

    image_url TEXT,

    available BOOLEAN DEFAULT TRUE
);
INSERT INTO restaurants
(name, district, rating, location, delivery_type)

VALUES

('Salem RR Biryani', 'salem', 4.5, 'Salem Junction', 'URBAN'),

('Banana Leaf Restaurant', 'trichy', 4.4, 'Trichy Central', 'URBAN'),

('Kumbakonam Degree Coffee', 'thanjavur', 4.6, 'Thanjavur Main', 'URBAN'),

('Hotel Gowri Krishna', 'theni', 4.4, 'Theni Main', 'RURAL'),

('Nagercoil Arya Bhavan', 'kanyakumari', 4.6, 'Nagercoil', 'URBAN'),

('Chettinad Virundhu', 'karaikudi', 4.8, 'Karaikudi Main', 'RURAL'),

('Pollachi Mess', 'pollachi', 4.5, 'Pollachi Town', 'RURAL'),

('Ooty Cafe', 'ooty', 4.7, 'Ooty Lake Road', 'URBAN'),

('Ambur Star Briyani', 'ambur', 4.9, 'Ambur Bazaar', 'URBAN'),

('Temple Tiffin Center', 'tiruvannamalai', 4.3, 'Temple Area', 'RURAL');

INSERT INTO food_products
(district, category, name, description, price, stock, rating, offer_tag, food_type, image_url, available)

VALUES

-- =========================
-- SALEM
-- =========================

('salem','Dinner','Salem Parotta',
'Layered parotta with spicy salna',
159,10,4.7,'Hot Selling','Non Veg',
'https://images.unsplash.com/photo-1604908177522-040f7c20af1e?auto=format&fit=crop&w=900&q=80',
true),

('salem','Lunch','Veg Meals',
'Traditional Tamil Nadu meals',
149,12,4.5,'Budget Meal','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('salem','Cafe','Filter Coffee',
'Authentic Salem filter coffee',
59,18,4.9,'Classic','Veg',
'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- TRICHY
-- =========================

('trichy','Lunch','Trichy Meals',
'Unlimited veg meals with sambar and rasam',
179,9,4.8,'Popular','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('trichy','Snacks','Kothu Parotta',
'Street style kothu parotta',
169,7,4.7,'Street Special','Non Veg',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
true),

('trichy','Cafe','Cold Coffee',
'Chocolate cold coffee',
119,14,4.5,'Refreshing','Veg',
'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- THANJAVUR
-- =========================

('thanjavur','Breakfast','Degree Coffee Combo',
'Traditional degree coffee with mini tiffin',
99,15,4.8,'Trending','Veg',
'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
true),

('thanjavur','Lunch','Delta Veg Meals',
'Cauvery delta special meals',
189,10,4.7,'Village Special','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('thanjavur','Dinner','Chicken Chukka',
'Spicy chicken chukka fry',
249,6,4.6,'Chef Choice','Non Veg',
'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- THENI
-- =========================

('theni','Lunch','Banana Leaf Meals',
'Village style banana leaf meals',
159,8,4.5,'Healthy Choice','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('theni','Dinner','Country Chicken Curry',
'Rural spicy country chicken curry',
269,5,4.8,'Village Special','Non Veg',
'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
true),

('theni','Cafe','Fresh Lime Juice',
'Fresh village lemon juice',
69,16,4.4,'Refreshing','Veg',
'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- KANYAKUMARI
-- =========================

('kanyakumari','Seafood','Fish Curry Meals',
'Coastal fish curry meals',
259,6,4.9,'Coastal Special','Non Veg',
'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80',
true),

('kanyakumari','Breakfast','Appam Combo',
'Soft appam with coconut milk',
139,10,4.7,'Traditional','Veg',
'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',
true),

('kanyakumari','Cafe','Tender Coconut Shake',
'Fresh coconut milkshake',
109,13,4.5,'Summer Special','Veg',
'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- KARAIKUDI
-- =========================

('karaikudi','Dinner','Chettinad Chicken Curry',
'Authentic Chettinad spicy curry',
249,5,4.9,'Chef Special','Non Veg',
'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
true),

('karaikudi','Lunch','Chettinad Meals',
'Traditional Chettinad meals',
199,9,4.8,'Traditional','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('karaikudi','Snacks','Karaikudi Pepper Chicken',
'Pepper spicy chicken fry',
219,7,4.7,'Hot & Spicy','Non Veg',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- POLLACHI
-- =========================

('pollachi','Lunch','Coconut Meals',
'Coconut rich Kongu meals',
189,11,4.6,'Healthy Choice','Veg',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
true),

('pollachi','Dinner','Grill Chicken',
'Pollachi style grilled chicken',
279,5,4.8,'Popular','Non Veg',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
true),

('pollachi','Cafe','Cold Badam Milk',
'Traditional chilled badam milk',
99,14,4.5,'Refreshing','Veg',
'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- OOTY
-- =========================

('ooty','Cafe','Hot Chocolate',
'Hill station hot chocolate',
149,12,4.9,'Winter Special','Veg',
'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
true),

('ooty','Breakfast','Bread Omelette',
'Ooty style bread omelette',
119,10,4.6,'Morning Special','Non Veg',
'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
true),

('ooty','Dinner','Mushroom Pasta',
'Creamy mushroom pasta',
229,8,4.7,'Cafe Special','Veg',
'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8f70?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- AMBUR
-- =========================

('ambur','Biryani','Ambur Chicken Biryani',
'World famous Ambur biryani',
299,4,5.0,'Top Rated','Non Veg',
'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80',
true),

('ambur','Snacks','Chicken 65',
'Spicy Ambur chicken 65',
189,7,4.8,'Trending','Non Veg',
'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
true),

('ambur','Dinner','Mutton Biryani',
'Traditional Ambur mutton biryani',
329,3,4.9,'Weekend Special','Non Veg',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
true),

-- =========================
-- TIRUVANNAMALAI
-- =========================

('tiruvannamalai','Breakfast','Temple Idli Combo',
'Soft idli with pongal and chutney',
119,14,4.5,'Morning Combo','Veg',
'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',
true),

('tiruvannamalai','Lunch','Sambar Meals',
'Temple town traditional meals',
159,9,4.4,'Budget Meal','Veg',
'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
true),

('tiruvannamalai','Cafe','Rose Milk',
'Cold rose milk drink',
79,18,4.6,'Cooling Special','Veg',
'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
true);
SELECT * FROM food_products;
SELECT district FROM food_products;
UPDATE food_products
SET district = LOWER(district);
ALTER TABLE food_products
ADD COLUMN restaurant_id INT;
UPDATE food_products
SET restaurant_id =

CASE district

WHEN 'salem' THEN 1
WHEN 'trichy' THEN 2
WHEN 'thanjavur' THEN 3
WHEN 'theni' THEN 4
WHEN 'kanyakumari' THEN 5
WHEN 'karaikudi' THEN 6
WHEN 'pollachi' THEN 7
WHEN 'ooty' THEN 8
WHEN 'ambur' THEN 9
WHEN 'tiruvannamalai' THEN 10

END;

ALTER TABLE food_products

ADD CONSTRAINT fk_restaurant

FOREIGN KEY (restaurant_id)

REFERENCES restaurants(id);
select * from food_products;
select * from restaurants;
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM food_products;
