USE anywhere;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE restaurants;
SET FOREIGN_KEY_CHECKS = 1;
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