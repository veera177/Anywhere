USE anywhere;

-- Disable foreign key checks for clean reload
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE food_products;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE grocery_products;
TRUNCATE TABLE grocery_stores;
TRUNCATE TABLE medicine_products;
TRUNCATE TABLE pharmacies;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. SEED RESTAURANTS (3 UNIQUE RESTAURANTS PER DISTRICT)
-- ============================================================================
INSERT INTO restaurants (id, name, district, rating, location, delivery_type, latitude, longitude, taluk, pincode, is_verified, is_active) VALUES
-- Salem
(1, 'Salem RR Biryani', 'salem', 4.7, 'Salem Junction, Suramangalam', 'URBAN', 11.6643, 78.1460, 'Salem West', '636005', 1, 1),
(2, 'Selvi Mess Heritage', 'salem', 4.6, 'Five Roads, Meyyanur', 'URBAN', 11.6710, 78.1380, 'Salem North', '636004', 1, 1),
(3, 'Mangalam Chettinad Kitchen', 'salem', 4.5, 'Ammapet Main Road', 'RURAL', 11.6520, 78.1750, 'Salem South', '636003', 1, 1),

-- Trichy
(4, 'Banana Leaf Restaurant', 'trichy', 4.6, 'Trichy Central Bus Stand', 'URBAN', 10.7905, 78.7047, 'Trichy Town', '620001', 1, 1),
(5, 'Sangeethas Pure Vegetarian', 'trichy', 4.7, 'Thillai Nagar Main Road', 'URBAN', 10.8280, 78.6890, 'Trichy West', '620018', 1, 1),
(6, 'Ezham Suvai Chettinad', 'trichy', 4.5, 'Srirangam Temple View Road', 'RURAL', 10.8620, 78.6980, 'Srirangam', '620006', 1, 1),

-- Thanjavur
(7, 'Kumbakonam Degree Coffee & Mess', 'thanjavur', 4.8, 'Old Bus Stand, South Rampart', 'URBAN', 10.7870, 79.1378, 'Thanjavur Central', '613001', 1, 1),
(8, 'Sathars Biryani & Grill', 'thanjavur', 4.5, 'Medical College Road', 'URBAN', 10.7650, 79.1120, 'Thanjavur South', '613004', 1, 1),
(9, 'Brihadeeswarar Tiffin House', 'thanjavur', 4.6, 'Kumbakonam Road, Palliagraharam', 'RURAL', 10.8120, 79.1550, 'Thanjavur North', '613003', 1, 1),

-- Theni
(10, 'Hotel Gowri Krishna', 'theni', 4.5, 'Theni Old Bus Stand', 'URBAN', 10.0104, 77.4768, 'Theni Main', '625531', 1, 1),
(11, 'Suruli Falls Non-Veg Mess', 'theni', 4.4, 'Periyakulam Highway', 'RURAL', 10.0350, 77.5120, 'Periyakulam', '625532', 1, 1),
(12, 'Cardamom Country Dhabha', 'theni', 4.6, 'Bodinayakanur Road, Cumbum', 'RURAL', 9.9850, 77.4320, 'Cumbum', '625513', 1, 1),

-- Kanyakumari
(13, 'Nagercoil Arya Bhavan', 'kanyakumari', 4.6, 'Clock Tower, Nagercoil', 'URBAN', 8.1833, 77.4119, 'Agasteeswaram', '629001', 1, 1),
(14, 'Cape Sea Treat Restaurant', 'kanyakumari', 4.7, 'Sunset Point Road, Kanyakumari', 'URBAN', 8.0880, 77.5385, 'Kanyakumari South', '629702', 1, 1),
(15, 'Marthandam Banana Leaf', 'kanyakumari', 4.5, 'Main Road, Marthandam', 'RURAL', 8.3050, 77.2180, 'Kalkulam', '629165', 1, 1),

-- Karaikudi
(16, 'Chettinad Virundhu Heritage', 'karaikudi', 4.8, 'New Bus Stand, Karaikudi', 'URBAN', 10.0732, 78.7675, 'Karaikudi Central', '630001', 1, 1),
(17, 'Friends Park Family Diner', 'karaikudi', 4.5, 'College Road, Subramaniyapuram', 'URBAN', 10.0650, 78.7820, 'Karaikudi East', '630002', 1, 1),
(18, 'Kottaiyur Palace Mess', 'karaikudi', 4.7, 'Kottaiyur Heritage Belt', 'RURAL', 10.1150, 78.7520, 'Kottaiyur', '630106', 1, 1),

-- Pollachi
(19, 'Pollachi Mess Traditional', 'pollachi', 4.6, 'Pollachi Market Road', 'URBAN', 10.6609, 77.0087, 'Pollachi West', '642001', 1, 1),
(20, 'Annamalaiyar Tiffin Centre', 'pollachi', 4.5, 'Mahalingapuram Main Road', 'URBAN', 10.6750, 77.0250, 'Pollachi North', '642002', 1, 1),
(21, 'Coconut Valley Village Kitchen', 'pollachi', 4.7, 'Palakkad Main Highway, Anaimalai', 'RURAL', 10.5850, 76.9320, 'Anaimalai', '642104', 1, 1),

-- Ooty
(22, 'Ooty Lake View Cafe & Kitchen', 'ooty', 4.7, 'Ooty Lake Road', 'URBAN', 11.4102, 76.6950, 'Udhagamandalam Central', '643001', 1, 1),
(23, 'Nilgiris Hot Bun Bakery & Bistro', 'ooty', 4.8, 'Charing Cross, Commercial Road', 'URBAN', 11.4160, 76.7080, 'Ooty Commercial', '643001', 1, 1),
(24, 'Ketti Valley Panoramic Diner', 'ooty', 4.6, 'Coonoor Road, Ketti', 'RURAL', 11.3780, 76.7350, 'Coonoor Belt', '643215', 1, 1),

-- Ambur
(25, 'Ambur Star Briyani', 'ambur', 4.9, 'Ambur Bazaar Main St', 'URBAN', 12.7900, 78.7160, 'Ambur West', '635802', 1, 1),
(26, 'Rahmaniya Biryani House', 'ambur', 4.6, 'NH48 Chennai-Bangalore Bypass', 'URBAN', 12.7980, 78.7280, 'Ambur North', '635802', 1, 1),
(27, 'Palikonda Golden Kitchen', 'ambur', 4.5, 'Reddy Thoppu, Pernambut Road', 'RURAL', 12.7650, 78.6920, 'Pernambut', '635810', 1, 1),

-- Tiruvannamalai
(28, 'Temple Tiffin Sannadhi Center', 'tiruvannamalai', 4.6, 'East Sannadhi Street, Arunachaleswarar', 'URBAN', 12.2253, 79.0747, 'Tiruvannamalai Town', '606601', 1, 1),
(29, 'Annamalai Hills Organic Cafe', 'tiruvannamalai', 4.7, 'Girivalam Inner Ring Road', 'RURAL', 12.2410, 79.0520, 'Girivalam Belt', '606603', 1, 1),
(30, 'Shanthi Veg Meals', 'tiruvannamalai', 4.4, 'Polur Main Highway', 'URBAN', 12.2350, 79.0890, 'Tiruvannamalai North', '606602', 1, 1),

-- Chennai
(31, 'Buhari Hotel 1951', 'chennai', 4.7, 'Anna Nagar 2nd Avenue', 'URBAN', 13.0850, 80.2150, 'Anna Nagar', '600040', 1, 1),
(32, 'Murugan Idli Shop', 'chennai', 4.8, 'T. Nagar, GN Chetty Road', 'URBAN', 13.0410, 80.2340, 'T. Nagar', '600017', 1, 1),
(33, 'Thalappakatti Biryani', 'chennai', 4.6, 'OMR IT Corridor, Thoraipakkam', 'URBAN', 12.9350, 80.2310, 'Sholinganallur', '600097', 1, 1),

-- Coimbatore
(34, 'Annapoorna Gowrishankar', 'coimbatore', 4.8, 'Gandhipuram Cross Cut Road', 'URBAN', 11.0168, 76.9658, 'Coimbatore North', '641012', 1, 1),
(35, 'Hari Bhavanam Non-Veg Special', 'coimbatore', 4.7, 'RS Puram, DB Road', 'URBAN', 11.0080, 76.9450, 'Coimbatore West', '641002', 1, 1),
(36, 'Kongu Naadu Mess', 'coimbatore', 4.6, 'Peelamedu, Avinashi Road', 'URBAN', 11.0280, 77.0120, 'Coimbatore East', '641004', 1, 1),

-- Madurai
(37, 'Murugan Idli Shop Heritage', 'madurai', 4.9, 'West Masi Street, Meenakshi Temple', 'URBAN', 9.9195, 78.1193, 'Madurai Central', '625001', 1, 1),
(38, 'Amma Mess Special Non-Veg', 'madurai', 4.8, 'KK Nagar Main Road', 'URBAN', 9.9320, 78.1480, 'Madurai North', '625020', 1, 1),
(39, 'Kumar Mess Virundhu', 'madurai', 4.7, 'Thiruparankundram Road', 'RURAL', 9.8820, 78.0850, 'Thiruparankundram', '625005', 1, 1),

-- Dindigul
(40, 'Dindigul Venu Biryani', 'dindigul', 4.8, 'Palani Road, Near Bus Stand', 'URBAN', 10.3650, 77.9750, 'Dindigul West', '624001', 1, 1),
(41, 'Ponram Non-Veg Hotel', 'dindigul', 4.7, 'Clock Tower, Main Bazaar', 'URBAN', 10.3610, 77.9820, 'Dindigul Central', '624002', 1, 1),
(42, 'Kurinji Tiffin Centre', 'dindigul', 4.5, 'Batlagundu Highway', 'RURAL', 10.3350, 77.9250, 'Dindigul South', '624005', 1, 1),

-- Tirunelveli
(43, 'Iruttu Kadai Halwa & Tiffin', 'tirunelveli', 4.9, 'East Car St, Nellaiyappar Temple', 'URBAN', 8.7280, 77.6890, 'Tirunelveli Town', '627006', 1, 1),
(44, 'Nellai Saravana Bhavan', 'tirunelveli', 4.6, 'Palayamkottai Bus Stand', 'URBAN', 8.7180, 77.7420, 'Palayamkottai', '627002', 1, 1),
(45, 'Thamirabarani Riverfront Diner', 'tirunelveli', 4.5, 'Vannarpettai Main Rd', 'URBAN', 8.7350, 77.7210, 'Tirunelveli North', '627003', 1, 1),

-- Erode
(46, 'Erode Thaligai Traditional', 'erode', 4.7, 'Brough Road, Near Clock Tower', 'URBAN', 11.3410, 77.7280, 'Erode Town', '638001', 1, 1),
(47, 'Kongu Virundhinar Hotel', 'erode', 4.6, 'Central Bus Stand Road', 'URBAN', 11.3380, 77.7190, 'Erode West', '638002', 1, 1),
(48, 'Bhavani River Breeze Cafe', 'erode', 4.5, 'Perundurai Bypass Road', 'RURAL', 11.3150, 77.6820, 'Perundurai', '638052', 1, 1),

-- Vellore
(49, 'Vellore Fort View Kitchen', 'vellore', 4.6, 'Anna Salai, Near Vellore Fort', 'URBAN', 12.9250, 79.1320, 'Vellore Central', '632004', 1, 1),
(50, 'Darling Residency Multi-Cuisine', 'vellore', 4.7, 'Katpadi Main Road', 'URBAN', 12.9650, 79.1410, 'Katpadi', '632014', 1, 1),
(51, 'Bagayam Hills Veg Treat', 'vellore', 4.5, 'Bagayam CMC Campus Road', 'RURAL', 12.8750, 79.1280, 'Vellore South', '632002', 1, 1),

-- Tiruppur
(52, 'Tiruppur Kongu Mess', 'tiruppur', 4.6, 'Kumaran Road, Near Railway Station', 'URBAN', 11.1085, 77.3410, 'Tiruppur Central', '641601', 1, 1),
(53, 'Cotton City Kitchen', 'tiruppur', 4.5, 'Avinashi Main Road', 'URBAN', 11.1250, 77.3220, 'Tiruppur North', '641603', 1, 1),
(54, 'Palladam Village Non-Veg', 'tiruppur', 4.7, 'Kangayam Highway, Palladam', 'RURAL', 11.0050, 77.2850, 'Palladam', '641664', 1, 1),

-- Namakkal
(55, 'Namakkal Anjaneyar Tiffin House', 'namakkal', 4.7, 'Main Road, Anjaneyar Temple', 'URBAN', 11.2189, 78.1674, 'Namakkal Town', '637001', 1, 1),
(56, 'Egg City Spicy Dhaba', 'namakkal', 4.6, 'Mohanur Road', 'URBAN', 11.2050, 78.1750, 'Namakkal South', '637002', 1, 1),
(57, 'Kolli Hills Herbal Resto', 'namakkal', 4.8, 'Sendamangalam Road', 'RURAL', 11.2850, 78.2320, 'Kolli Belt', '637409', 1, 1),

-- Karur
(58, 'Karur Pasupatheeswarar Mess', 'karur', 4.6, 'Jawahar Bazaar, Near Temple', 'URBAN', 10.9601, 78.0766, 'Karur Town', '639001', 1, 1),
(59, 'Amaravathi River View Hotel', 'karur', 4.5, 'Vengamedu Main Road', 'URBAN', 10.9750, 78.0620, 'Karur North', '639006', 1, 1),
(60, 'Textile City Express Food', 'karur', 4.4, 'Pasupathipalayam Road', 'RURAL', 10.9420, 78.0950, 'Karur South', '639004', 1, 1),

-- Hosur
(61, 'Hosur SIPCOT Biryani & Grill', 'hosur', 4.7, 'SIPCOT Phase 1, Bangalore Highway', 'URBAN', 12.7409, 77.8253, 'Hosur Industrial', '635126', 1, 1),
(62, 'Hill View Udupi Veg Corner', 'hosur', 4.6, 'Bagalur Road, Near Ring Road', 'URBAN', 12.7550, 77.8420, 'Hosur North', '635109', 1, 1),
(63, 'Denkanikottai Rustic Kitchen', 'hosur', 4.5, 'Thally Highway, Denkanikottai', 'RURAL', 12.5250, 77.7850, 'Denkanikottai', '635107', 1, 1),

-- Kanchipuram
(64, 'Kanchi Idli & Silk Town Foods', 'kanchipuram', 4.8, 'Gandhi Road, Near Varadharajar', 'URBAN', 12.8342, 79.7036, 'Kanchipuram Central', '631501', 1, 1),
(65, 'Ekambaranathar Temple Tiffin', 'kanchipuram', 4.7, 'Sannathi Street', 'URBAN', 12.8420, 79.6980, 'Kanchipuram North', '631502', 1, 1),
(66, 'Walajabad Village Mess', 'kanchipuram', 4.5, 'Chengalpattu Highway, Walajabad', 'RURAL', 12.7950, 79.8250, 'Walajabad', '631605', 1, 1),

-- Chengalpattu
(67, 'Chengalpattu Lake View Diner', 'chengalpattu', 4.6, 'GST Road, Near Toll Gate', 'URBAN', 12.6841, 79.9836, 'Chengalpattu Town', '603001', 1, 1),
(68, 'Mahabalipuram Seafood Bay', 'chengalpattu', 4.9, 'East Coast Road, Mahabalipuram', 'URBAN', 12.6250, 80.1920, 'Thirukalukundram', '603104', 1, 1),
(69, 'Vedanthangal Bird Sanctuary Cafe', 'chengalpattu', 4.5, 'Madurantakam Highway', 'RURAL', 12.5450, 79.8550, 'Madurantakam', '603314', 1, 1),

-- Tiruvallur
(70, 'Veeraraghava Swamy Tiffin Center', 'tiruvallur', 4.7, 'JN Road, Near Big Temple', 'URBAN', 13.1432, 79.9079, 'Tiruvallur Central', '602001', 1, 1),
(71, 'Poondi Lake Non-Veg Dhabha', 'tiruvallur', 4.5, 'Poondi Reservoir Road', 'RURAL', 13.1850, 79.8650, 'Poondi', '602023', 1, 1),
(72, 'Sriperumbudur Highway Express', 'tiruvallur', 4.6, 'Bangalore Trunk Road', 'URBAN', 12.9750, 79.9450, 'Sriperumbudur', '602105', 1, 1),

-- Villupuram
(73, 'Villupuram Junction Meals', 'villupuram', 4.5, 'Old Bus Stand, Nehruji Road', 'URBAN', 11.9401, 79.4861, 'Villupuram Town', '605602', 1, 1),
(74, 'Gingee Fort Royal Mess', 'villupuram', 4.8, 'Gingee Main Road', 'RURAL', 12.2520, 79.4180, 'Gingee', '604202', 1, 1),
(75, 'Tindivanam Highway Food Plaza', 'villupuram', 4.6, 'GST Road, Tindivanam', 'URBAN', 12.2350, 79.6520, 'Tindivanam', '604001', 1, 1),

-- Ramanathapuram
(76, 'Sethupathi Palace Kitchen', 'ramanathapuram', 4.6, 'Aranmanai Street, Ramanathapuram', 'URBAN', 9.3639, 78.8395, 'Ramanathapuram Town', '623501', 1, 1),
(77, 'Rameswaram Sea Treat', 'ramanathapuram', 4.8, 'Temple Car Street, Rameswaram', 'URBAN', 9.2880, 79.3120, 'Rameswaram', '623526', 1, 1),
(78, 'Kilakarai Coastal Biryani', 'ramanathapuram', 4.7, 'Coastal Road, Kilakarai', 'RURAL', 9.2350, 78.7850, 'Kilakarai', '623517', 1, 1),

-- Pudukkottai
(79, 'Pudukkottai Palace Virundhu', 'pudukkottai', 4.7, 'Main Bazaar, Santhanathapuram', 'URBAN', 10.3833, 78.8001, 'Pudukkottai Central', '622001', 1, 1),
(80, 'Sittannavasal Heritage Cafe', 'pudukkottai', 4.5, 'Sittannavasal Cave Road', 'RURAL', 10.4550, 78.7250, 'Illupur', '622101', 1, 1),
(81, 'Aranthangi Coconut Grove Diner', 'pudukkottai', 4.6, 'Pattukkottai Highway, Aranthangi', 'RURAL', 10.1650, 78.9950, 'Aranthangi', '614616', 1, 1);

-- ============================================================================
-- 2. SEED GROCERY STORES (3 UNIQUE GROCERY STORES PER DISTRICT)
-- ============================================================================
INSERT INTO grocery_stores (id, name, district, rating, location, delivery_type, latitude, longitude, taluk, pincode, is_verified, is_active) VALUES
-- Salem
(1, 'Salem Fresh Mart', 'salem', 4.7, 'Salem Junction Market, Suramangalam', 'URBAN', 11.6643, 78.1460, 'Salem West', '636005', 1, 1),
(2, 'Ponni Nilayam Provisions', 'salem', 4.6, 'Five Roads, Meyyanur', 'URBAN', 11.6710, 78.1380, 'Salem North', '636004', 1, 1),
(3, 'Green Valley Organic Bazaar', 'salem', 4.8, 'Ammapet Bazaar Road', 'RURAL', 11.6520, 78.1750, 'Salem South', '636003', 1, 1),

-- Trichy
(4, 'Trichy Organic Plaza', 'trichy', 4.6, 'Central Bus Stand Complex', 'URBAN', 10.7905, 78.7047, 'Trichy Town', '620001', 1, 1),
(5, 'Kaveri Supermarket', 'trichy', 4.8, 'Thillai Nagar 10th Cross', 'URBAN', 10.8280, 78.6890, 'Trichy West', '620018', 1, 1),
(6, 'Rockfort Daily Needs', 'trichy', 4.5, 'Srirangam South Chitra St', 'RURAL', 10.8620, 78.6980, 'Srirangam', '620006', 1, 1),

-- Thanjavur
(7, 'Thanjavur Grains & Rice Store', 'thanjavur', 4.7, 'South Rampart, Old Bus Stand', 'URBAN', 10.7870, 79.1378, 'Thanjavur Central', '613001', 1, 1),
(8, 'Brihadeeshwara Fresh Mart', 'thanjavur', 4.6, 'Medical College Road', 'URBAN', 10.7650, 79.1120, 'Thanjavur South', '613004', 1, 1),
(9, 'Delta Farmers Organic Hub', 'thanjavur', 4.8, 'Kumbakonam Main Road', 'RURAL', 10.8120, 79.1550, 'Thanjavur North', '613003', 1, 1),

-- Theni
(10, 'Theni Farm Fresh Veggie Market', 'theni', 4.8, 'Old Bus Stand Road', 'URBAN', 10.0104, 77.4768, 'Theni Main', '625531', 1, 1),
(11, 'Suruli Spices & Provisions', 'theni', 4.6, 'Periyakulam Bazaar', 'RURAL', 10.0350, 77.5120, 'Periyakulam', '625532', 1, 1),
(12, 'Highland Organic Store', 'theni', 4.7, 'Cumbum Valley Road', 'RURAL', 9.9850, 77.4320, 'Cumbum', '625513', 1, 1),

-- Kanyakumari
(13, 'Nagercoil Heritage Supermarket', 'kanyakumari', 4.7, 'Clock Tower Square', 'URBAN', 8.1833, 77.4119, 'Agasteeswaram', '629001', 1, 1),
(14, 'Cape Coastal Grocery Hub', 'kanyakumari', 4.5, 'Kanyakumari Main Bazaar', 'URBAN', 8.0880, 77.5385, 'Kanyakumari South', '629702', 1, 1),
(15, 'Marthandam Honey & Agro Mart', 'kanyakumari', 4.9, 'Marthandam Junction', 'RURAL', 8.3050, 77.2180, 'Kalkulam', '629165', 1, 1),

-- Karaikudi
(16, 'Karaikudi Spices & Grocery Corner', 'karaikudi', 4.9, 'New Bus Stand Commercial St', 'URBAN', 10.0732, 78.7675, 'Karaikudi Central', '630001', 1, 1),
(17, 'Chettinad Traditional Provisions', 'karaikudi', 4.7, 'Sekkalai Road', 'URBAN', 10.0650, 78.7820, 'Karaikudi East', '630002', 1, 1),
(18, 'Kottaiyur Farm Direct Mart', 'karaikudi', 4.6, 'Kottaiyur Village Road', 'RURAL', 10.1150, 78.7520, 'Kottaiyur', '630106', 1, 1),

-- Pollachi
(19, 'Pollachi Coconut & Pure Oils Mart', 'pollachi', 4.8, 'Market Road, Pollachi Town', 'URBAN', 10.6609, 77.0087, 'Pollachi West', '642001', 1, 1),
(20, 'Kongu Fresh Harvest Supermarket', 'pollachi', 4.7, 'Mahalingapuram Main St', 'URBAN', 10.6750, 77.0250, 'Pollachi North', '642002', 1, 1),
(21, 'Anaimalai Organic Farm Depot', 'pollachi', 4.6, 'Anaimalai Road', 'RURAL', 10.5850, 76.9320, 'Anaimalai', '642104', 1, 1),

-- Ooty
(22, 'Ooty Organic Greens & Berries', 'ooty', 4.9, 'Ooty Lake Entrance Bazaar', 'URBAN', 11.4102, 76.6950, 'Udhagamandalam Central', '643001', 1, 1),
(23, 'Nilgiri Tea & Spice Superstore', 'ooty', 4.8, 'Commercial Road, Charing Cross', 'URBAN', 11.4160, 76.7080, 'Ooty Commercial', '643001', 1, 1),
(24, 'Coonoor Valley Farm Basket', 'ooty', 4.7, 'Ketti Valley Road', 'RURAL', 11.3780, 76.7350, 'Coonoor Belt', '643215', 1, 1),

-- Ambur
(25, 'Ambur Town Provision Store', 'ambur', 4.5, 'Ambur Bazaar Main St', 'URBAN', 12.7900, 78.7160, 'Ambur West', '635802', 1, 1),
(26, 'Bismillah Daily Needs Supermarket', 'ambur', 4.7, 'NH48 Service Road', 'URBAN', 12.7980, 78.7280, 'Ambur North', '635802', 1, 1),
(27, 'Pernambut Fresh Agro Mart', 'ambur', 4.6, 'Pernambut Highway', 'RURAL', 12.7650, 78.6920, 'Pernambut', '635810', 1, 1),

-- Tiruvannamalai
(28, 'Tiruvannamalai Organic Agro Mart', 'tiruvannamalai', 4.8, 'East Sannadhi Street', 'URBAN', 12.2253, 79.0747, 'Tiruvannamalai Town', '606601', 1, 1),
(29, 'Arunachala Herbal & Grocery Store', 'tiruvannamalai', 4.7, 'Girivalam Ring Road', 'RURAL', 12.2410, 79.0520, 'Girivalam Belt', '606603', 1, 1),
(30, 'Deepam Supermarket', 'tiruvannamalai', 4.6, 'Polur Main Highway', 'URBAN', 12.2350, 79.0890, 'Tiruvannamalai North', '606602', 1, 1),

-- Chennai
(31, 'Nilgiris 1905 Supermarket', 'chennai', 4.8, 'Anna Nagar 3rd Avenue', 'URBAN', 13.0850, 80.2150, 'Anna Nagar', '600040', 1, 1),
(32, 'Pazhamudir Nilayam Premium', 'chennai', 4.9, 'T. Nagar Pondy Bazaar', 'URBAN', 13.0410, 80.2340, 'T. Nagar', '600017', 1, 1),
(33, 'Fresh2Home Gourmet Mart', 'chennai', 4.7, 'Velachery Main Road', 'URBAN', 12.9750, 80.2210, 'Velachery', '600042', 1, 1),

-- Coimbatore
(34, 'Kannan Jubilee Department Store', 'coimbatore', 4.8, 'Gandhipuram Cross Cut Road', 'URBAN', 11.0168, 76.9658, 'Coimbatore North', '641012', 1, 1),
(35, 'Pazhamudir R.S. Puram Express', 'coimbatore', 4.9, 'RS Puram, DB Road', 'URBAN', 11.0080, 76.9450, 'Coimbatore West', '641002', 1, 1),
(36, 'Kongu Naturals & Organic Mart', 'coimbatore', 4.7, 'Peelamedu, Avinashi Road', 'URBAN', 11.0280, 77.0120, 'Coimbatore East', '641004', 1, 1),

-- Madurai
(37, 'Madurai Meenakshi Super Store', 'madurai', 4.8, 'West Tower Street', 'URBAN', 9.9195, 78.1193, 'Madurai Central', '625001', 1, 1),
(38, 'Pandian Farmers Harvest Mart', 'madurai', 4.7, 'KK Nagar 80 Feet Road', 'URBAN', 9.9320, 78.1480, 'Madurai North', '625020', 1, 1),
(39, 'Jasmine Valley Provisions', 'madurai', 4.6, 'Thiruparankundram Bazaar', 'RURAL', 9.8820, 78.0850, 'Thiruparankundram', '625005', 1, 1),

-- Dindigul
(40, 'Dindigul Daily Fresh Market', 'dindigul', 4.6, 'Palani Road Commercial Area', 'URBAN', 10.3650, 77.9750, 'Dindigul West', '624001', 1, 1),
(41, 'Lock City Mega Mart', 'dindigul', 4.7, 'Main Bazaar, Clock Tower', 'URBAN', 10.3610, 77.9820, 'Dindigul Central', '624002', 1, 1),
(42, 'Sirumalai Hill Produce Depot', 'dindigul', 4.8, 'Sirumalai Road, Sanarpatti', 'RURAL', 10.3350, 77.9250, 'Dindigul South', '624005', 1, 1),

-- Tirunelveli
(43, 'Nellai Rice & Provisions Depot', 'tirunelveli', 4.8, 'West Car Street', 'URBAN', 8.7280, 77.6890, 'Tirunelveli Town', '627006', 1, 1),
(44, 'Palayamkottai Fresh Mart', 'tirunelveli', 4.7, 'Palayamkottai Market Complex', 'URBAN', 8.7180, 77.7420, 'Palayamkottai', '627002', 1, 1),
(45, 'Thamirabarani Organic Store', 'tirunelveli', 4.6, 'Vannarpettai Main Road', 'URBAN', 8.7350, 77.7210, 'Tirunelveli North', '627003', 1, 1),

-- Erode
(46, 'Erode Turmeric & Grain Emporium', 'erode', 4.9, 'Brough Road Market', 'URBAN', 11.3410, 77.7280, 'Erode Town', '638001', 1, 1),
(47, 'Kongu Farm Fresh Supermarket', 'erode', 4.7, 'Central Bus Stand Area', 'URBAN', 11.3380, 77.7190, 'Erode West', '638002', 1, 1),
(48, 'Bhavani Organic Store', 'erode', 4.6, 'Perundurai Road', 'RURAL', 11.3150, 77.6820, 'Perundurai', '638052', 1, 1),

-- Vellore
(49, 'Vellore Fort Super Bazaar', 'vellore', 4.6, 'Anna Salai, Vellore Fort Area', 'URBAN', 12.9250, 79.1320, 'Vellore Central', '632004', 1, 1),
(50, 'Katpadi Fresh Express Grocery', 'vellore', 4.7, 'Katpadi Junction Road', 'URBAN', 12.9650, 79.1410, 'Katpadi', '632014', 1, 1),
(51, 'Green Hills Farm Store', 'vellore', 4.5, 'Bagayam CMC Road', 'RURAL', 12.8750, 79.1280, 'Vellore South', '632002', 1, 1),

-- Tiruppur
(52, 'Tiruppur Daily Fresh Provisions', 'tiruppur', 4.6, 'Kumaran Road Market', 'URBAN', 11.1085, 77.3410, 'Tiruppur Central', '641601', 1, 1),
(53, 'Avinashi Supermarket', 'tiruppur', 4.7, 'Avinashi Road', 'URBAN', 11.1250, 77.3220, 'Tiruppur North', '641603', 1, 1),
(54, 'Palladam Agro Store', 'tiruppur', 4.5, 'Palladam Main Road', 'RURAL', 11.0050, 77.2850, 'Palladam', '641664', 1, 1),

-- Namakkal
(55, 'Namakkal Fresh Provisions', 'namakkal', 4.6, 'Anjaneyar Temple Road', 'URBAN', 11.2189, 78.1674, 'Namakkal Town', '637001', 1, 1),
(56, 'Mohanur Agro Store', 'namakkal', 4.5, 'Mohanur Road', 'URBAN', 11.2050, 78.1750, 'Namakkal South', '637002', 1, 1),
(57, 'Kolli Organics', 'namakkal', 4.8, 'Sendamangalam Road', 'RURAL', 11.2850, 78.2320, 'Kolli Belt', '637409', 1, 1),

-- Karur
(58, 'Karur Fresh Mart', 'karur', 4.6, 'Jawahar Bazaar', 'URBAN', 10.9601, 78.0766, 'Karur Town', '639001', 1, 1),
(59, 'Amaravathi Provisions', 'karur', 4.5, 'Vengamedu Road', 'URBAN', 10.9750, 78.0620, 'Karur North', '639006', 1, 1),
(60, 'Pasupathi Supermarket', 'karur', 4.4, 'Pasupathipalayam', 'RURAL', 10.9420, 78.0950, 'Karur South', '639004', 1, 1),

-- Hosur
(61, 'Hosur SIPCOT Hypermarket', 'hosur', 4.8, 'SIPCOT Phase 1', 'URBAN', 12.7409, 77.8253, 'Hosur Industrial', '635126', 1, 1),
(62, 'Bagalur Fresh Produce', 'hosur', 4.6, 'Bagalur Road', 'URBAN', 12.7550, 77.8420, 'Hosur North', '635109', 1, 1),
(63, 'Thally Valley Organics', 'hosur', 4.7, 'Thally Road', 'RURAL', 12.5250, 77.7850, 'Denkanikottai', '635107', 1, 1),

-- Kanchipuram
(64, 'Kanchi Super Bazaar', 'kanchipuram', 4.7, 'Gandhi Road', 'URBAN', 12.8342, 79.7036, 'Kanchipuram Central', '631501', 1, 1),
(65, 'Temple View Grocery', 'kanchipuram', 4.6, 'Sannathi Street', 'URBAN', 12.8420, 79.6980, 'Kanchipuram North', '631502', 1, 1),
(66, 'Walajabad Agro Mart', 'kanchipuram', 4.5, 'Walajabad Main Road', 'RURAL', 12.7950, 79.8250, 'Walajabad', '631605', 1, 1),

-- Chengalpattu
(67, 'Chengalpattu Daily Needs', 'chengalpattu', 4.6, 'GST Road', 'URBAN', 12.6841, 79.9836, 'Chengalpattu Town', '603001', 1, 1),
(68, 'Mahabalipuram Fresh Coast', 'chengalpattu', 4.7, 'East Coast Road', 'URBAN', 12.6250, 80.1920, 'Thirukalukundram', '603104', 1, 1),
(69, 'Madurantakam Farmers Market', 'chengalpattu', 4.5, 'Madurantakam Highway', 'RURAL', 12.5450, 79.8550, 'Madurantakam', '603314', 1, 1),

-- Tiruvallur
(70, 'Tiruvallur Fresh Bazaar', 'tiruvallur', 4.7, 'JN Road', 'URBAN', 13.1432, 79.9079, 'Tiruvallur Central', '602001', 1, 1),
(71, 'Poondi Organic Provisions', 'tiruvallur', 4.5, 'Poondi Road', 'RURAL', 13.1850, 79.8650, 'Poondi', '602023', 1, 1),
(72, 'Sriperumbudur Mega Mart', 'tiruvallur', 4.6, 'Bangalore Trunk Road', 'URBAN', 12.9750, 79.9450, 'Sriperumbudur', '602105', 1, 1),

-- Villupuram
(73, 'Villupuram Supermarket', 'villupuram', 4.6, 'Old Bus Stand', 'URBAN', 11.9401, 79.4861, 'Villupuram Town', '605602', 1, 1),
(74, 'Gingee Fort Organic Stores', 'villupuram', 4.7, 'Gingee Road', 'RURAL', 12.2520, 79.4180, 'Gingee', '604202', 1, 1),
(75, 'Tindivanam Provisions Hub', 'villupuram', 4.5, 'GST Road', 'URBAN', 12.2350, 79.6520, 'Tindivanam', '604001', 1, 1),

-- Ramanathapuram
(76, 'Sethupathi Daily Store', 'ramanathapuram', 4.6, 'Aranmanai Street', 'URBAN', 9.3639, 78.8395, 'Ramanathapuram Town', '623501', 1, 1),
(77, 'Rameswaram Island Supermarket', 'ramanathapuram', 4.8, 'Temple Car Street', 'URBAN', 9.2880, 79.3120, 'Rameswaram', '623526', 1, 1),
(78, 'Kilakarai Spices & Provisions', 'ramanathapuram', 4.7, 'Coastal Road', 'RURAL', 9.2350, 78.7850, 'Kilakarai', '623517', 1, 1),

-- Pudukkottai
(79, 'Pudukkottai Central Supermarket', 'pudukkottai', 4.7, 'Main Bazaar', 'URBAN', 10.3833, 78.8001, 'Pudukkottai Central', '622001', 1, 1),
(80, 'Illupur Farm Fresh Mart', 'pudukkottai', 4.5, 'Sittannavasal Road', 'RURAL', 10.4550, 78.7250, 'Illupur', '622101', 1, 1),
(81, 'Aranthangi Rice & Provisions', 'pudukkottai', 4.6, 'Pattukkottai Highway', 'RURAL', 10.1650, 78.9950, 'Aranthangi', '614616', 1, 1);

-- ============================================================================
-- 3. SEED PHARMACIES (3 UNIQUE PHARMACIES PER DISTRICT)
-- ============================================================================
INSERT INTO pharmacies (id, name, district, rating, location, delivery_type, latitude, longitude, taluk, pincode, is_verified, is_active) VALUES
-- Salem
(1, 'Apollo Care Pharmacy', 'salem', 4.8, 'Salem Junction, Suramangalam', 'URBAN', 11.6643, 78.1460, 'Salem West', '636005', 1, 1),
(2, 'MedPlus 24x7 Health Store', 'salem', 4.7, 'Five Roads, Meyyanur', 'URBAN', 11.6710, 78.1380, 'Salem North', '636004', 1, 1),
(3, 'Salem Sanjeevi Medicals', 'salem', 4.6, 'Ammapet Main Bazaar', 'RURAL', 11.6520, 78.1750, 'Salem South', '636003', 1, 1),

-- Trichy
(4, 'Kauvery Health Pharmacy', 'trichy', 4.8, 'Central Bus Stand Arcade', 'URBAN', 10.7905, 78.7047, 'Trichy Town', '620001', 1, 1),
(5, 'Thillai Nagar MedZone', 'trichy', 4.7, 'Thillai Nagar Main Road', 'URBAN', 10.8280, 78.6890, 'Trichy West', '620018', 1, 1),
(6, 'Srirangam Temple Medicals', 'trichy', 4.6, 'Srirangam North Uthra St', 'RURAL', 10.8620, 78.6980, 'Srirangam', '620006', 1, 1),

-- Thanjavur
(7, 'Thanjavur Wellness Pharmacy', 'thanjavur', 4.7, 'South Rampart, Old Bus Stand', 'URBAN', 10.7870, 79.1378, 'Thanjavur Central', '613001', 1, 1),
(8, 'Meenakshi Hospital Pharmacy', 'thanjavur', 4.8, 'Medical College Road', 'URBAN', 10.7650, 79.1120, 'Thanjavur South', '613004', 1, 1),
(9, 'Siddha & Modern Medicals', 'thanjavur', 4.5, 'Kumbakonam Main Road', 'RURAL', 10.8120, 79.1550, 'Thanjavur North', '613003', 1, 1),

-- Theni
(10, 'Green Life Medicals', 'theni', 4.7, 'Theni Old Bus Stand', 'URBAN', 10.0104, 77.4768, 'Theni Main', '625531', 1, 1),
(11, 'Vaigai Valley Pharmacy', 'theni', 4.6, 'Periyakulam Hospital Road', 'RURAL', 10.0350, 77.5120, 'Periyakulam', '625532', 1, 1),
(12, 'Cardamom Hills MedCare', 'theni', 4.5, 'Cumbum Main Road', 'RURAL', 9.9850, 77.4320, 'Cumbum', '625513', 1, 1),

-- Kanyakumari
(13, 'Nagercoil Health Point Pharmacy', 'kanyakumari', 4.8, 'Clock Tower Road', 'URBAN', 8.1833, 77.4119, 'Agasteeswaram', '629001', 1, 1),
(14, 'Cape Care Meds', 'kanyakumari', 4.6, 'Kanyakumari Main Street', 'URBAN', 8.0880, 77.5385, 'Kanyakumari South', '629702', 1, 1),
(15, 'Marthandam Emergency Medicals', 'kanyakumari', 4.7, 'Marthandam Hospital Junction', 'RURAL', 8.3050, 77.2180, 'Kalkulam', '629165', 1, 1),

-- Karaikudi
(16, 'Karaikudi Cure Pharmacy', 'karaikudi', 4.8, 'New Bus Stand Commercial Complex', 'URBAN', 10.0732, 78.7675, 'Karaikudi Central', '630001', 1, 1),
(17, 'Alagappa Medical Stores', 'karaikudi', 4.7, 'College Road, Subramaniyapuram', 'URBAN', 10.0650, 78.7820, 'Karaikudi East', '630002', 1, 1),
(18, 'Kottaiyur Community Pharmacy', 'karaikudi', 4.6, 'Kottaiyur Main Road', 'RURAL', 10.1150, 78.7520, 'Kottaiyur', '630106', 1, 1),

-- Pollachi
(19, 'Pollachi Family Medicals', 'pollachi', 4.7, 'Pollachi Market Road', 'URBAN', 10.6609, 77.0087, 'Pollachi West', '642001', 1, 1),
(20, 'Mahalingapuram Health Hub', 'pollachi', 4.8, 'Mahalingapuram Main Road', 'URBAN', 10.6750, 77.0250, 'Pollachi North', '642002', 1, 1),
(21, 'Anaimalai Herbal Pharmacy', 'pollachi', 4.6, 'Anaimalai Junction', 'RURAL', 10.5850, 76.9320, 'Anaimalai', '642104', 1, 1),

-- Ooty
(22, 'Ooty Hill Pharmacy', 'ooty', 4.9, 'Ooty Lake Road', 'URBAN', 11.4102, 76.6950, 'Udhagamandalam Central', '643001', 1, 1),
(23, 'Nilgiris Herbal & Allopathy', 'ooty', 4.8, 'Charing Cross Commercial St', 'URBAN', 11.4160, 76.7080, 'Ooty Commercial', '643001', 1, 1),
(24, 'Coonoor Alpine Medicals', 'ooty', 4.7, 'Ketti Valley Road', 'RURAL', 11.3780, 76.7350, 'Coonoor Belt', '643215', 1, 1),

-- Ambur
(25, 'Ambur Med Care Pharmacy', 'ambur', 4.7, 'Ambur Bazaar Main Road', 'URBAN', 12.7900, 78.7160, 'Ambur West', '635802', 1, 1),
(26, 'LifeLine 24 Hours Medicals', 'ambur', 4.6, 'NH48 Service Road', 'URBAN', 12.7980, 78.7280, 'Ambur North', '635802', 1, 1),
(27, 'Pernambut Health Care', 'ambur', 4.5, 'Pernambut Road', 'RURAL', 12.7650, 78.6920, 'Pernambut', '635810', 1, 1),

-- Tiruvannamalai
(28, 'Arunachala Medical Store', 'tiruvannamalai', 4.8, 'East Sannadhi Street', 'URBAN', 12.2253, 79.0747, 'Tiruvannamalai Town', '606601', 1, 1),
(29, 'Ramana Maharshi Health Center', 'tiruvannamalai', 4.9, 'Girivalam Inner Ring Road', 'RURAL', 12.2410, 79.0520, 'Girivalam Belt', '606603', 1, 1),
(30, 'Deepam 24/7 Pharmacy', 'tiruvannamalai', 4.6, 'Polur Main Highway', 'URBAN', 12.2350, 79.0890, 'Tiruvannamalai North', '606602', 1, 1),

-- Chennai
(31, 'Apollo 24x7 Pharmacy Anna Nagar', 'chennai', 4.9, 'Anna Nagar 2nd Avenue', 'URBAN', 13.0850, 80.2150, 'Anna Nagar', '600040', 1, 1),
(32, 'MedPlus Health Hub T Nagar', 'chennai', 4.8, 'T. Nagar Pondy Bazaar', 'URBAN', 13.0410, 80.2340, 'T. Nagar', '600017', 1, 1),
(33, 'Fortis Health Clinic Pharmacy', 'chennai', 4.7, 'Velachery 100 Feet Road', 'URBAN', 12.9750, 80.2210, 'Velachery', '600042', 1, 1),

-- Coimbatore
(34, 'KMCH City Pharmacy', 'coimbatore', 4.9, 'Gandhipuram Cross Cut Road', 'URBAN', 11.0168, 76.9658, 'Coimbatore North', '641012', 1, 1),
(35, 'PSG Health Care RS Puram', 'coimbatore', 4.8, 'RS Puram, DB Road', 'URBAN', 11.0080, 76.9450, 'Coimbatore West', '641002', 1, 1),
(36, 'Ganga Hospital Medicals', 'coimbatore', 4.7, 'Peelamedu, Avinashi Road', 'URBAN', 11.0280, 77.0120, 'Coimbatore East', '641004', 1, 1),

-- Madurai
(37, 'Meenakshi Mission Pharmacy', 'madurai', 4.9, 'West Tower Street', 'URBAN', 9.9195, 78.1193, 'Madurai Central', '625001', 1, 1),
(38, 'Apollo Pharmacy KK Nagar', 'madurai', 4.8, 'KK Nagar Main Road', 'URBAN', 9.9320, 78.1480, 'Madurai North', '625020', 1, 1),
(39, 'Subramaniaswamy Medicals', 'madurai', 4.6, 'Thiruparankundram Road', 'RURAL', 9.8820, 78.0850, 'Thiruparankundram', '625005', 1, 1),

-- Dindigul
(40, 'Dindigul City Pharmacy', 'dindigul', 4.7, 'Palani Road', 'URBAN', 10.3650, 77.9750, 'Dindigul West', '624001', 1, 1),
(41, 'St Joseph Health Store', 'dindigul', 4.6, 'Clock Tower Square', 'URBAN', 10.3610, 77.9820, 'Dindigul Central', '624002', 1, 1),
(42, 'Kurinji Herbal & Meds', 'dindigul', 4.5, 'Batlagundu Road', 'RURAL', 10.3350, 77.9250, 'Dindigul South', '624005', 1, 1),

-- Tirunelveli
(43, 'Nellai Apollo Meds', 'tirunelveli', 4.8, 'West Car Street', 'URBAN', 8.7280, 77.6890, 'Tirunelveli Town', '627006', 1, 1),
(44, 'Palayamkottai Medical Hall', 'tirunelveli', 4.7, 'Palayamkottai Main Road', 'URBAN', 8.7180, 77.7420, 'Palayamkottai', '627002', 1, 1),
(45, 'Thamirabarani Health Store', 'tirunelveli', 4.6, 'Vannarpettai Road', 'URBAN', 8.7350, 77.7210, 'Tirunelveli North', '627003', 1, 1),

-- Erode
(46, 'Erode Medical Plaza', 'erode', 4.8, 'Brough Road', 'URBAN', 11.3410, 77.7280, 'Erode Town', '638001', 1, 1),
(47, 'Kongu Health Hub', 'erode', 4.7, 'Central Bus Stand Complex', 'URBAN', 11.3380, 77.7190, 'Erode West', '638002', 1, 1),
(48, 'Bhavani River Meds', 'erode', 4.6, 'Perundurai Road', 'RURAL', 11.3150, 77.6820, 'Perundurai', '638052', 1, 1),

-- Vellore
(49, 'CMC Campus Pharmacy', 'vellore', 4.9, 'Ida Scudder Road, Near CMC', 'URBAN', 12.9250, 79.1320, 'Vellore Central', '632004', 1, 1),
(50, 'Katpadi Station Medicals', 'vellore', 4.7, 'Katpadi Main Road', 'URBAN', 12.9650, 79.1410, 'Katpadi', '632014', 1, 1),
(51, 'Bagayam Community Health Clinic', 'vellore', 4.8, 'Bagayam Road', 'RURAL', 12.8750, 79.1280, 'Vellore South', '632002', 1, 1),

-- Tiruppur
(52, 'Tiruppur Care Pharmacy', 'tiruppur', 4.7, 'Kumaran Road', 'URBAN', 11.1085, 77.3410, 'Tiruppur Central', '641601', 1, 1),
(53, 'Avinashi Road MedPlus', 'tiruppur', 4.8, 'Avinashi Road', 'URBAN', 11.1250, 77.3220, 'Tiruppur North', '641603', 1, 1),
(54, 'Palladam LifeCare Medicals', 'tiruppur', 4.6, 'Palladam Main Road', 'RURAL', 11.0050, 77.2850, 'Palladam', '641664', 1, 1),

-- Namakkal
(55, 'Namakkal City Pharmacy', 'namakkal', 4.7, 'Anjaneyar Temple Street', 'URBAN', 11.2189, 78.1674, 'Namakkal Town', '637001', 1, 1),
(56, 'Mohanur Medical Stores', 'namakkal', 4.6, 'Mohanur Road', 'URBAN', 11.2050, 78.1750, 'Namakkal South', '637002', 1, 1),
(57, 'Kolli Hills Ayurvedic & Meds', 'namakkal', 4.8, 'Sendamangalam Road', 'RURAL', 11.2850, 78.2320, 'Kolli Belt', '637409', 1, 1),

-- Karur
(58, 'Karur Apollo Pharmacy', 'karur', 4.7, 'Jawahar Bazaar', 'URBAN', 10.9601, 78.0766, 'Karur Town', '639001', 1, 1),
(59, 'Vengamedu Medical Stores', 'karur', 4.6, 'Vengamedu Road', 'URBAN', 10.9750, 78.0620, 'Karur North', '639006', 1, 1),
(60, 'Pasupatheeswarar Health Mart', 'karur', 4.5, 'Pasupathipalayam', 'RURAL', 10.9420, 78.0950, 'Karur South', '639004', 1, 1),

-- Hosur
(61, 'Hosur SIPCOT Health Center', 'hosur', 4.8, 'SIPCOT Phase 1', 'URBAN', 12.7409, 77.8253, 'Hosur Industrial', '635126', 1, 1),
(62, 'Bagalur Road MedZone', 'hosur', 4.7, 'Bagalur Road', 'URBAN', 12.7550, 77.8420, 'Hosur North', '635109', 1, 1),
(63, 'Thally Valley Meds', 'hosur', 4.6, 'Thally Highway', 'RURAL', 12.5250, 77.7850, 'Denkanikottai', '635107', 1, 1),

-- Kanchipuram
(64, 'Kanchi Apollo Pharmacy', 'kanchipuram', 4.8, 'Gandhi Road', 'URBAN', 12.8342, 79.7036, 'Kanchipuram Central', '631501', 1, 1),
(65, 'Temple City MedCare', 'kanchipuram', 4.7, 'Sannathi Street', 'URBAN', 12.8420, 79.6980, 'Kanchipuram North', '631502', 1, 1),
(66, 'Walajabad Health Hall', 'kanchipuram', 4.5, 'Walajabad Main Road', 'RURAL', 12.7950, 79.8250, 'Walajabad', '631605', 1, 1),

-- Chengalpattu
(67, 'Chengalpattu MedPlus 24/7', 'chengalpattu', 4.7, 'GST Road', 'URBAN', 12.6841, 79.9836, 'Chengalpattu Town', '603001', 1, 1),
(68, 'Mahabalipuram Tourist Clinic & Meds', 'chengalpattu', 4.8, 'East Coast Road', 'URBAN', 12.6250, 80.1920, 'Thirukalukundram', '603104', 1, 1),
(69, 'Madurantakam Community Pharmacy', 'chengalpattu', 4.6, 'Madurantakam Road', 'RURAL', 12.5450, 79.8550, 'Madurantakam', '603314', 1, 1),

-- Tiruvallur
(70, 'Tiruvallur District Pharmacy', 'tiruvallur', 4.8, 'JN Road', 'URBAN', 13.1432, 79.9079, 'Tiruvallur Central', '602001', 1, 1),
(71, 'Poondi Primary Care Meds', 'tiruvallur', 4.5, 'Poondi Road', 'RURAL', 13.1850, 79.8650, 'Poondi', '602023', 1, 1),
(72, 'Sriperumbudur Industrial Health Hub', 'tiruvallur', 4.7, 'Bangalore Trunk Road', 'URBAN', 12.9750, 79.9450, 'Sriperumbudur', '602105', 1, 1),

-- Villupuram
(73, 'Villupuram City Medicals', 'villupuram', 4.7, 'Old Bus Stand', 'URBAN', 11.9401, 79.4861, 'Villupuram Town', '605602', 1, 1),
(74, 'Gingee Fort Pharmacy', 'villupuram', 4.8, 'Gingee Main Road', 'RURAL', 12.2520, 79.4180, 'Gingee', '604202', 1, 1),
(75, 'Tindivanam MedCare', 'villupuram', 4.6, 'GST Road', 'URBAN', 12.2350, 79.6520, 'Tindivanam', '604001', 1, 1),

-- Ramanathapuram
(76, 'Sethupathi Medicals', 'ramanathapuram', 4.7, 'Aranmanai Street', 'URBAN', 9.3639, 78.8395, 'Ramanathapuram Town', '623501', 1, 1),
(77, 'Rameswaram Pilgrim Pharmacy', 'ramanathapuram', 4.9, 'Temple Car Street', 'URBAN', 9.2880, 79.3120, 'Rameswaram', '623526', 1, 1),
(78, 'Kilakarai Coastal Meds', 'ramanathapuram', 4.6, 'Coastal Road', 'RURAL', 9.2350, 78.7850, 'Kilakarai', '623517', 1, 1),

-- Pudukkottai
(79, 'Pudukkottai Health Plaza', 'pudukkottai', 4.8, 'Main Bazaar', 'URBAN', 10.3833, 78.8001, 'Pudukkottai Central', '622001', 1, 1),
(80, 'Illupur Rural Medical Store', 'pudukkottai', 4.6, 'Sittannavasal Road', 'RURAL', 10.4550, 78.7250, 'Illupur', '622101', 1, 1),
(81, 'Aranthangi LifeLine Pharmacy', 'pudukkottai', 4.7, 'Pattukkottai Highway', 'RURAL', 10.1650, 78.9950, 'Aranthangi', '614616', 1, 1);

-- ============================================================================
-- 4. SEED PRODUCTS LINKED TO ALL STORES
-- ============================================================================

-- Food Products linked to each Restaurant
INSERT INTO food_products (district, category, name, description, price, stock, rating, offer_tag, food_type, image_url, available, restaurant_id)
SELECT r.district, 'Dinner', CONCAT(r.name, ' Special Biryani'), 'Aromatic seeraga samba rice cooked with special spices', 249, 20, 4.8, 'Chef Special', 'Non Veg', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80', 1, r.id
FROM restaurants r;

INSERT INTO food_products (district, category, name, description, price, stock, rating, offer_tag, food_type, image_url, available, restaurant_id)
SELECT r.district, 'Lunch', CONCAT(r.name, ' Traditional Thali'), 'Full authentic Tamil Nadu meals served with variety gravies', 169, 25, 4.7, 'Bestseller', 'Veg', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80', 1, r.id
FROM restaurants r;

INSERT INTO food_products (district, category, name, description, price, stock, rating, offer_tag, food_type, image_url, available, restaurant_id)
SELECT r.district, 'Breakfast', CONCAT(r.name, ' Ghee Roast Dosa'), 'Crispy golden dosa roasted in pure cow ghee with chutney & sambar', 89, 30, 4.9, 'Morning Classic', 'Veg', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80', 1, r.id
FROM restaurants r;

INSERT INTO food_products (district, category, name, description, price, stock, rating, offer_tag, food_type, image_url, available, restaurant_id)
SELECT r.district, 'Snacks', CONCAT(r.name, ' Filter Coffee & Vada'), 'Fresh brewed Kumbakonam style filter coffee with crispy medu vada', 49, 50, 4.9, 'Evening Special', 'Veg', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80', 1, r.id
FROM restaurants r;

-- Grocery Products linked to each Grocery Store
INSERT INTO grocery_products (district, category, name, description, price, stock, rating, offer_tag, unit_type, image_url, available, store_id)
SELECT gs.district, 'Staples', CONCAT('Ponni Boiled Rice (', gs.name, ')'), 'High quality polished South Indian Ponni boiled rice', 280, 40, 4.8, 'Top Quality', '5 kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80', 1, gs.id
FROM grocery_stores gs;

INSERT INTO grocery_products (district, category, name, description, price, stock, rating, offer_tag, unit_type, image_url, available, store_id)
SELECT gs.district, 'Dairy', CONCAT('Fresh Farm Milk (', gs.name, ')'), '100% pure organic unadulterated cow milk', 55, 60, 4.9, 'Fresh Daily', '1 Litre', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80', 1, gs.id
FROM grocery_stores gs;

INSERT INTO grocery_products (district, category, name, description, price, stock, rating, offer_tag, unit_type, image_url, available, store_id)
SELECT gs.district, 'Vegetables', CONCAT('Organic Farm Veggie Box (', gs.name, ')'), 'Assorted fresh vegetables (Tomatoes, Onions, Potatoes, Carrots)', 140, 35, 4.7, 'Farmer Direct', '2 kg', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80', 1, gs.id
FROM grocery_stores gs;

INSERT INTO grocery_products (district, category, name, description, price, stock, rating, offer_tag, unit_type, image_url, available, store_id)
SELECT gs.district, 'Fruits', CONCAT('Fresh Red Apples (', gs.name, ')'), 'Crisp, sweet Shimla apples rich in vitamins', 190, 30, 4.8, 'Fresh Pick', '1 kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80', 1, gs.id
FROM grocery_stores gs;

-- Medicine Products linked to each Pharmacy
INSERT INTO medicine_products (district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id)
SELECT p.district, 'Pain Relief', CONCAT('Paracetamol 650mg (', p.name, ')'), 'Effective relief from fever, headache, body pain', 35, 100, 4.8, 'Essential', '650mg', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80', 1, p.id
FROM pharmacies p;

INSERT INTO medicine_products (district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id)
SELECT p.district, 'Immunity', CONCAT('Vitamin C + Zinc Chewable (', p.name, ')'), 'Boosts daily immune response and energy levels', 95, 80, 4.9, 'Popular', '500mg', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80', 1, p.id
FROM pharmacies p;

INSERT INTO medicine_products (district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id)
SELECT p.district, 'First Aid', CONCAT('Antiseptic Dettol & Bandage Kit (', p.name, ')'), 'Complete first aid antiseptic liquid and sterile adhesive strips', 120, 50, 4.9, 'Safety Must-Have', '100ml Kit', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80', 1, p.id
FROM pharmacies p;

INSERT INTO medicine_products (district, category, name, description, price, stock, rating, offer_tag, dosage, image_url, available, pharmacy_id)
SELECT p.district, 'Digestive', CONCAT('Antacid Gas Relief Syrup (', p.name, ')'), 'Fast soothing relief from acidity, heartburn, and gas', 85, 60, 4.7, 'Quick Relief', '200ml', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80', 1, p.id
FROM pharmacies p;
