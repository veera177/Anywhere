USE anywhere;

-- Adds the three district datasets without changing existing tables or rows.
-- The project stores districts as text values on partner/product tables; it
-- does not contain a districts table. Tier 2 is stored in platform_settings.

INSERT INTO platform_settings (setting_key, setting_value) VALUES
('district.chengalpattu.tier', '2'),
('district.kanchipuram.tier', '2'),
('district.tiruvallur.tier', '2')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- 3 restaurants per district
INSERT INTO restaurants
(name,district,rating,location,delivery_type,latitude,longitude,taluk,pincode,is_verified,is_active)
SELECT s.name,s.district,s.rating,s.location,'URBAN',s.lat,s.lon,s.taluk,s.pin,1,1
FROM (
 SELECT 'Chengalpattu Anna Idli Kadai' name,'chengalpattu' district,4.6 rating,'GST Road, Chengalpattu Town' location,12.6900 lat,79.9800 lon,'Chengalpattu Town' taluk,'603001' pin
 UNION ALL SELECT 'Kovil Street Biryani House','chengalpattu',4.5,'Kovil Street, Chengalpattu Town',12.6940,79.9840,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Green Leaf Vegetarian Mess','chengalpattu',4.4,'Old Bus Stand Road, Chengalpattu',12.6860,79.9760,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Kanchi Kudil Traditional Mess','kanchipuram',4.7,'Gandhi Road, Kanchipuram Town',12.8300,79.7000,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Silk City Biryani Corner','kanchipuram',4.6,'Ennaikaran Street, Kanchipuram',12.8340,79.7040,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Varadaraja Sweets & Tiffin','kanchipuram',4.5,'Sannathi Street, Kanchipuram',12.8260,79.6960,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Tiruvallur Junction Mess','tiruvallur',4.5,'Junction Road, Tiruvallur Town',13.1400,79.9100,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Cool Breeze Biryani Point','tiruvallur',4.6,'Chennai-Tirupati Highway, Tiruvallur',13.1440,79.9140,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Amman Kovil Tiffin Center','tiruvallur',4.4,'Amman Kovil Street, Tiruvallur',13.1360,79.9060,'Tiruvallur Town','602001'
) s
WHERE NOT EXISTS (SELECT 1 FROM restaurants x WHERE x.name=s.name AND x.district=s.district);

-- Food products linked to the inserted/current restaurant IDs.
INSERT INTO food_products
(district,category,name,description,price,stock,rating,offer_tag,food_type,image_url,available,restaurant_id)
SELECT s.district,s.category,s.name,s.description,s.price,100,r.rating,'Local Partner',s.food_type,NULL,1,r.id
FROM (
 SELECT 'chengalpattu' district,'Breakfast' category,'Idli' name,'Soft steamed idli with chutney' description,35 price,'VEG' food_type,'Chengalpattu Anna Idli Kadai' partner
 UNION ALL SELECT 'chengalpattu','Breakfast','Sambar Vadai','Crisp vadai served with sambar',45,'VEG','Chengalpattu Anna Idli Kadai'
 UNION ALL SELECT 'chengalpattu','Beverage','Filter Coffee','South Indian filter coffee',25,'VEG','Chengalpattu Anna Idli Kadai'
 UNION ALL SELECT 'chengalpattu','Breakfast','Pongal','Ven pongal with chutney',55,'VEG','Chengalpattu Anna Idli Kadai'
 UNION ALL SELECT 'chengalpattu','Biryani','Chicken Biryani','Aromatic chicken biryani',220,'NON-VEG','Kovil Street Biryani House'
 UNION ALL SELECT 'chengalpattu','Biryani','Mutton Biryani','Aromatic mutton biryani',280,'NON-VEG','Kovil Street Biryani House'
 UNION ALL SELECT 'chengalpattu','Biryani','Egg Biryani','Egg biryani with raita',150,'NON-VEG','Kovil Street Biryani House'
 UNION ALL SELECT 'chengalpattu','Meals','Veg Meals','Traditional vegetarian meals',90,'VEG','Green Leaf Vegetarian Mess'
 UNION ALL SELECT 'chengalpattu','Rice','Curd Rice','Seasoned curd rice',55,'VEG','Green Leaf Vegetarian Mess'
 UNION ALL SELECT 'chengalpattu','Tiffin','Rava Dosa','Crisp semolina dosa',60,'VEG','Green Leaf Vegetarian Mess'
 UNION ALL SELECT 'chengalpattu','Tiffin','Poori Masala','Poori with potato masala',65,'VEG','Green Leaf Vegetarian Mess'
 UNION ALL SELECT 'kanchipuram','Breakfast','Kanchipuram Idli','Traditional spiced Kanchipuram idli',60,'VEG','Kanchi Kudil Traditional Mess'
 UNION ALL SELECT 'kanchipuram','Rice','Sambar Sadam','Sambar rice with vegetables',75,'VEG','Kanchi Kudil Traditional Mess'
 UNION ALL SELECT 'kanchipuram','Curry','Vada Curry','South Indian vada curry',70,'VEG','Kanchi Kudil Traditional Mess'
 UNION ALL SELECT 'kanchipuram','Biryani','Chicken Biryani','Aromatic chicken biryani',210,'NON-VEG','Silk City Biryani Corner'
 UNION ALL SELECT 'kanchipuram','Starter','Chicken 65','Spiced fried chicken',130,'NON-VEG','Silk City Biryani Corner'
 UNION ALL SELECT 'kanchipuram','Biryani','Mutton Biryani','Aromatic mutton biryani',290,'NON-VEG','Silk City Biryani Corner'
 UNION ALL SELECT 'kanchipuram','Sweet','Rava Kesari','Semolina kesari sweet',50,'VEG','Varadaraja Sweets & Tiffin'
 UNION ALL SELECT 'kanchipuram','Breakfast','Pongal','Ven pongal with chutney',55,'VEG','Varadaraja Sweets & Tiffin'
 UNION ALL SELECT 'kanchipuram','Breakfast','Vadai','Crisp South Indian vadai',35,'VEG','Varadaraja Sweets & Tiffin'
 UNION ALL SELECT 'kanchipuram','Beverage','Filter Coffee','South Indian filter coffee',25,'VEG','Varadaraja Sweets & Tiffin'
 UNION ALL SELECT 'tiruvallur','Meals','Veg Meals','Traditional vegetarian meals',85,'VEG','Tiruvallur Junction Mess'
 UNION ALL SELECT 'tiruvallur','Tiffin','Chapati Kurma','Chapati with vegetable kurma',65,'VEG','Tiruvallur Junction Mess'
 UNION ALL SELECT 'tiruvallur','Rice','Curd Rice','Seasoned curd rice',50,'VEG','Tiruvallur Junction Mess'
 UNION ALL SELECT 'tiruvallur','Biryani','Chicken Biryani','Aromatic chicken biryani',200,'NON-VEG','Cool Breeze Biryani Point'
 UNION ALL SELECT 'tiruvallur','Biryani','Mutton Biryani','Aromatic mutton biryani',270,'NON-VEG','Cool Breeze Biryani Point'
 UNION ALL SELECT 'tiruvallur','Rice','Egg Fried Rice','Egg fried rice with vegetables',120,'NON-VEG','Cool Breeze Biryani Point'
 UNION ALL SELECT 'tiruvallur','Breakfast','Idli','Soft steamed idli with chutney',35,'VEG','Amman Kovil Tiffin Center'
 UNION ALL SELECT 'tiruvallur','Tiffin','Masala Dosa','Crisp dosa with potato masala',55,'VEG','Amman Kovil Tiffin Center'
 UNION ALL SELECT 'tiruvallur','Breakfast','Pongal','Ven pongal with chutney',55,'VEG','Amman Kovil Tiffin Center'
 UNION ALL SELECT 'tiruvallur','Beverage','Filter Coffee','South Indian filter coffee',25,'VEG','Amman Kovil Tiffin Center'
) s JOIN restaurants r ON r.name=s.partner AND r.district=s.district
WHERE NOT EXISTS (SELECT 1 FROM food_products x WHERE x.name=s.name AND x.district=s.district AND x.restaurant_id=r.id);

-- 3 grocery stores per district
INSERT INTO grocery_stores
(name,district,rating,location,delivery_type,latitude,longitude,taluk,pincode,is_verified,is_active)
SELECT s.name,s.district,s.rating,s.location,'URBAN',s.lat,s.lon,s.taluk,s.pin,1,1
FROM (
 SELECT 'Chengalpattu Fresh Mart' name,'chengalpattu' district,4.6 rating,'GST Road, Chengalpattu Town' location,12.6905 lat,79.9805 lon,'Chengalpattu Town' taluk,'603001' pin
 UNION ALL SELECT 'Anna Nagar Grocery Store','chengalpattu',4.5,'Anna Nagar Main Road, Chengalpattu',12.6945,79.9845,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Daily Needs Supermarket','chengalpattu',4.4,'Old Bus Stand Road, Chengalpattu',12.6865,79.9765,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Kanchi Grocery Bazaar','kanchipuram',4.6,'Gandhi Road, Kanchipuram Town',12.8305,79.7005,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Temple Town Provisions','kanchipuram',4.5,'Temple Street, Kanchipuram',12.8345,79.7045,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Kamakshi Super Store','kanchipuram',4.4,'Kamakshi Amman Road, Kanchipuram',12.8265,79.6965,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Tiruvallur Daily Mart','tiruvallur',4.6,'Junction Road, Tiruvallur Town',13.1405,79.9105,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Nemili Road Grocery','tiruvallur',4.5,'Nemili Road, Tiruvallur',13.1445,79.9145,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Highway Fresh Store','tiruvallur',4.4,'Chennai-Tirupati Highway, Tiruvallur',13.1365,79.9065,'Tiruvallur Town','602001'
) s
WHERE NOT EXISTS (SELECT 1 FROM grocery_stores x WHERE x.name=s.name AND x.district=s.district);

INSERT INTO grocery_products
(district,category,name,description,price,stock,rating,offer_tag,unit_type,image_url,available,store_id)
SELECT s.district,s.category,s.name,s.description,s.price,100,g.rating,'Local Partner',s.unit,NULL,1,g.id
FROM (
 SELECT 'chengalpattu' district,'Staples' category,'Rice 25kg' name,'Everyday rice pack' description,1100 price,'25 kg' unit,'Chengalpattu Fresh Mart' partner
 UNION ALL SELECT 'chengalpattu','Pulses','Toor Dal 1kg','Premium toor dal',140,'1 kg','Chengalpattu Fresh Mart'
 UNION ALL SELECT 'chengalpattu','Oils','Sunflower Oil 1L','Refined sunflower oil',150,'1 L','Chengalpattu Fresh Mart'
 UNION ALL SELECT 'chengalpattu','Dairy','Milk 500ml','Fresh milk packet',28,'500 ml','Chengalpattu Fresh Mart'
 UNION ALL SELECT 'chengalpattu','Staples','Wheat Flour 5kg','Whole wheat flour',220,'5 kg','Anna Nagar Grocery Store'
 UNION ALL SELECT 'chengalpattu','Staples','Sugar 1kg','Fine crystal sugar',45,'1 kg','Anna Nagar Grocery Store'
 UNION ALL SELECT 'chengalpattu','Vegetables','Onions 1kg','Fresh onions',35,'1 kg','Anna Nagar Grocery Store'
 UNION ALL SELECT 'chengalpattu','Vegetables','Tomatoes 1kg','Fresh tomatoes',30,'1 kg','Anna Nagar Grocery Store'
 UNION ALL SELECT 'chengalpattu','Staples','Basmati Rice 5kg','Long grain basmati rice',480,'5 kg','Daily Needs Supermarket'
 UNION ALL SELECT 'chengalpattu','Staples','Salt 1kg','Iodised salt',20,'1 kg','Daily Needs Supermarket'
 UNION ALL SELECT 'chengalpattu','Beverages','Tea Powder 250g','Everyday tea powder',90,'250 g','Daily Needs Supermarket'
 UNION ALL SELECT 'kanchipuram','Staples','Rice 25kg','Everyday rice pack',1080,'25 kg','Kanchi Grocery Bazaar'
 UNION ALL SELECT 'kanchipuram','Pulses','Moong Dal 1kg','Premium moong dal',130,'1 kg','Kanchi Grocery Bazaar'
 UNION ALL SELECT 'kanchipuram','Oils','Groundnut Oil 1L','Groundnut oil',180,'1 L','Kanchi Grocery Bazaar'
 UNION ALL SELECT 'kanchipuram','Staples','Wheat Flour 5kg','Whole wheat flour',210,'5 kg','Temple Town Provisions'
 UNION ALL SELECT 'kanchipuram','Staples','Sugar 1kg','Fine crystal sugar',44,'1 kg','Temple Town Provisions'
 UNION ALL SELECT 'kanchipuram','Fruits','Bananas 1dozen','Fresh bananas',50,'1 dozen','Temple Town Provisions'
 UNION ALL SELECT 'kanchipuram','Staples','Basmati Rice 5kg','Long grain basmati rice',470,'5 kg','Kamakshi Super Store'
 UNION ALL SELECT 'kanchipuram','Dairy','Milk 500ml','Fresh milk packet',27,'500 ml','Kamakshi Super Store'
 UNION ALL SELECT 'kanchipuram','Dairy','Curd 400g','Fresh curd cup',35,'400 g','Kamakshi Super Store'
 UNION ALL SELECT 'tiruvallur','Staples','Rice 25kg','Everyday rice pack',1090,'25 kg','Tiruvallur Daily Mart'
 UNION ALL SELECT 'tiruvallur','Pulses','Toor Dal 1kg','Premium toor dal',135,'1 kg','Tiruvallur Daily Mart'
 UNION ALL SELECT 'tiruvallur','Oils','Sunflower Oil 1L','Refined sunflower oil',148,'1 L','Tiruvallur Daily Mart'
 UNION ALL SELECT 'tiruvallur','Staples','Wheat Flour 5kg','Whole wheat flour',215,'5 kg','Nemili Road Grocery'
 UNION ALL SELECT 'tiruvallur','Vegetables','Onions 1kg','Fresh onions',34,'1 kg','Nemili Road Grocery'
 UNION ALL SELECT 'tiruvallur','Staples','Sugar 1kg','Fine crystal sugar',43,'1 kg','Nemili Road Grocery'
 UNION ALL SELECT 'tiruvallur','Staples','Basmati Rice 5kg','Long grain basmati rice',475,'5 kg','Highway Fresh Store'
 UNION ALL SELECT 'tiruvallur','Beverages','Tea Powder 250g','Everyday tea powder',88,'250 g','Highway Fresh Store'
 UNION ALL SELECT 'tiruvallur','Dairy','Milk 500ml','Fresh milk packet',26,'500 ml','Highway Fresh Store'
) s JOIN grocery_stores g ON g.name=s.partner AND g.district=s.district
WHERE NOT EXISTS (SELECT 1 FROM grocery_products x WHERE x.name=s.name AND x.district=s.district AND x.store_id=g.id);

-- 3 pharmacies per district
INSERT INTO pharmacies
(name,district,rating,location,delivery_type,latitude,longitude,taluk,pincode,is_verified,is_active)
SELECT s.name,s.district,s.rating,s.location,'URBAN',s.lat,s.lon,s.taluk,s.pin,1,1
FROM (
 SELECT 'Chengalpattu Medical Store' name,'chengalpattu' district,4.6 rating,'GST Road, Chengalpattu Town' location,12.6910 lat,79.9810 lon,'Chengalpattu Town' taluk,'603001' pin
 UNION ALL SELECT 'Anna Pharmacy','chengalpattu',4.5,'Anna Nagar Main Road, Chengalpattu',12.6950,79.9850,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Wellness Care Chemist','chengalpattu',4.4,'Old Bus Stand Road, Chengalpattu',12.6870,79.9770,'Chengalpattu Town','603001'
 UNION ALL SELECT 'Kanchi Health Pharmacy','kanchipuram',4.7,'Gandhi Road, Kanchipuram Town',12.8310,79.7010,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Temple City Medicals','kanchipuram',4.6,'Temple Street, Kanchipuram',12.8350,79.7050,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Varadaraja Chemist','kanchipuram',4.5,'Sannathi Street, Kanchipuram',12.8270,79.6970,'Kanchipuram Town','631501'
 UNION ALL SELECT 'Tiruvallur Central Pharmacy','tiruvallur',4.6,'Junction Road, Tiruvallur Town',13.1410,79.9110,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Nemili Road Medicals','tiruvallur',4.5,'Nemili Road, Tiruvallur',13.1450,79.9150,'Tiruvallur Town','602001'
 UNION ALL SELECT 'Highway Health Chemist','tiruvallur',4.4,'Chennai-Tirupati Highway, Tiruvallur',13.1370,79.9070,'Tiruvallur Town','602001'
) s
WHERE NOT EXISTS (SELECT 1 FROM pharmacies x WHERE x.name=s.name AND x.district=s.district);

-- medicine_products has no prescription_required column in the existing schema.
-- Prescription status is retained in category/description without changing schema.
INSERT INTO medicine_products
(district,category,name,description,price,stock,rating,offer_tag,dosage,image_url,available,pharmacy_id)
SELECT s.district,s.category,s.name,s.description,s.price,100,p.rating,'Local Pharmacy',s.dosage,NULL,1,p.id
FROM (
 SELECT 'chengalpattu' district,'Pain Relief' category,'Paracetamol 500mg' name,'No prescription required.' description,20 price,'500mg' dosage,'Chengalpattu Medical Store' partner
 UNION ALL SELECT 'chengalpattu','Antibiotic - Prescription Required','Amoxicillin 250mg','Prescription required; use only with doctor advice.',60,'250mg','Chengalpattu Medical Store'
 UNION ALL SELECT 'chengalpattu','Rehydration','ORS Sachet','No prescription required.',15,'21g','Chengalpattu Medical Store'
 UNION ALL SELECT 'chengalpattu','Cold and Allergy','Cetirizine 10mg','No prescription required.',25,'10mg','Anna Pharmacy'
 UNION ALL SELECT 'chengalpattu','Antibiotic - Prescription Required','Azithromycin 500mg','Prescription required; use only with doctor advice.',85,'500mg','Anna Pharmacy'
 UNION ALL SELECT 'chengalpattu','Vitamins','Vitamin C tablets','No prescription required.',90,'500mg','Anna Pharmacy'
 UNION ALL SELECT 'chengalpattu','Pain Relief','Ibuprofen 400mg','No prescription required.',30,'400mg','Wellness Care Chemist'
 UNION ALL SELECT 'chengalpattu','Diabetes - Prescription Required','Metformin 500mg','Prescription required; consult a doctor.',45,'500mg','Wellness Care Chemist'
 UNION ALL SELECT 'chengalpattu','Cough and Cold','Cough Syrup','No prescription required.',65,'100ml','Wellness Care Chemist'
 UNION ALL SELECT 'kanchipuram','Pain Relief','Paracetamol 500mg','No prescription required.',19,'500mg','Kanchi Health Pharmacy'
 UNION ALL SELECT 'kanchipuram','Antibiotic - Prescription Required','Amoxicillin 250mg','Prescription required; use only with doctor advice.',58,'250mg','Kanchi Health Pharmacy'
 UNION ALL SELECT 'kanchipuram','Cold and Allergy','Cetirizine 10mg','No prescription required.',24,'10mg','Temple City Medicals'
 UNION ALL SELECT 'kanchipuram','Antibiotic - Prescription Required','Azithromycin 500mg','Prescription required; use only with doctor advice.',82,'500mg','Temple City Medicals'
 UNION ALL SELECT 'kanchipuram','Pain Relief','Ibuprofen 400mg','No prescription required.',28,'400mg','Varadaraja Chemist'
 UNION ALL SELECT 'kanchipuram','Diabetes - Prescription Required','Metformin 500mg','Prescription required; consult a doctor.',42,'500mg','Varadaraja Chemist'
 UNION ALL SELECT 'tiruvallur','Pain Relief','Paracetamol 500mg','No prescription required.',21,'500mg','Tiruvallur Central Pharmacy'
 UNION ALL SELECT 'tiruvallur','Antibiotic - Prescription Required','Amoxicillin 250mg','Prescription required; use only with doctor advice.',62,'250mg','Tiruvallur Central Pharmacy'
 UNION ALL SELECT 'tiruvallur','Cold and Allergy','Cetirizine 10mg','No prescription required.',26,'10mg','Nemili Road Medicals'
 UNION ALL SELECT 'tiruvallur','Antibiotic - Prescription Required','Azithromycin 500mg','Prescription required; use only with doctor advice.',88,'500mg','Nemili Road Medicals'
 UNION ALL SELECT 'tiruvallur','Pain Relief','Ibuprofen 400mg','No prescription required.',31,'400mg','Highway Health Chemist'
 UNION ALL SELECT 'tiruvallur','Diabetes - Prescription Required','Metformin 500mg','Prescription required; consult a doctor.',47,'500mg','Highway Health Chemist'
 UNION ALL SELECT 'tiruvallur','Rehydration','ORS Sachet','No prescription required.',16,'21g','Highway Health Chemist'
) s JOIN pharmacies p ON p.name=s.partner AND p.district=s.district
WHERE NOT EXISTS (SELECT 1 FROM medicine_products x WHERE x.name=s.name AND x.district=s.district AND x.pharmacy_id=p.id);

-- Verification
SELECT district,COUNT(*) restaurant_count FROM restaurants WHERE district IN ('chengalpattu','kanchipuram','tiruvallur') GROUP BY district;
SELECT district,COUNT(*) grocery_store_count FROM grocery_stores WHERE district IN ('chengalpattu','kanchipuram','tiruvallur') GROUP BY district;
SELECT district,COUNT(*) pharmacy_count FROM pharmacies WHERE district IN ('chengalpattu','kanchipuram','tiruvallur') GROUP BY district;
