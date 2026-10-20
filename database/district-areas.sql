USE anywhere;

-- ═══════════════════════════════════════════════════════════════════════════
-- DISTRICTS & DISTRICT AREAS SCHEMA AND SEEDING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS district_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    area_name VARCHAR(150) NOT NULL,
    subtext VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    pincode VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_district_areas_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    INDEX idx_district_area_name (district_id, area_name)
);

-- Seed districts
INSERT INTO districts (id, name, code) VALUES
(1, 'Salem', 'salem'),
(2, 'Trichy', 'trichy'),
(3, 'Thanjavur', 'thanjavur'),
(4, 'Theni', 'theni'),
(5, 'Kanyakumari', 'kanyakumari'),
(6, 'Karaikudi', 'karaikudi'),
(7, 'Pollachi', 'pollachi'),
(8, 'Ooty', 'ooty'),
(9, 'Ambur', 'ambur'),
(10, 'Tiruvannamalai', 'tiruvannamalai'),
(11, 'Chennai', 'chennai'),
(12, 'Coimbatore', 'coimbatore'),
(13, 'Madurai', 'madurai'),
(14, 'Dindigul', 'dindigul'),
(15, 'Tirunelveli', 'tirunelveli'),
(16, 'Erode', 'erode'),
(17, 'Vellore', 'vellore'),
(18, 'Tiruppur', 'tiruppur'),
(19, 'Namakkal', 'namakkal'),
(20, 'Karur', 'karur'),
(21, 'Hosur', 'hosur'),
(22, 'Kanchipuram', 'kanchipuram'),
(23, 'Chengalpattu', 'chengalpattu'),
(24, 'Tiruvallur', 'tiruvallur'),
(25, 'Villupuram', 'villupuram'),
(26, 'Ramanathapuram', 'ramanathapuram'),
(27, 'Pudukkottai', 'pudukkottai')
ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code);

-- Seed district_areas
TRUNCATE TABLE district_areas;

INSERT INTO district_areas (district_id, area_name, subtext, latitude, longitude, pincode) VALUES
-- 23: Chengalpattu
(23, 'Chengalpattu Bus Stand', 'Chengalpattu Town, Chengalpattu, Tamil Nadu', 12.6860000, 79.9760000, '603001'),
(23, 'Chengalpattu Railway Station', 'Station Road, Chengalpattu, Tamil Nadu', 12.6905000, 79.9805000, '603001'),
(23, 'Singaperumal Koil', 'GST Road, Chengalpattu, Tamil Nadu', 12.7635000, 80.0035000, '603204'),
(23, 'Maraimalai Nagar', 'Industrial Corridor, Chengalpattu, Tamil Nadu', 12.7960000, 80.0240000, '603209'),
(23, 'Mahindra World City', 'Anjur, Chengalpattu, Tamil Nadu', 12.7380000, 80.0050000, '603004'),
(23, 'Vandalur', 'GST Road, Chengalpattu, Tamil Nadu', 12.8910000, 80.0810000, '600048'),
(23, 'Guduvancherry', 'GST Road, Chengalpattu, Tamil Nadu', 12.8440000, 80.0620000, '603202'),
(23, 'Tirukalukundram', 'Temple Town, Chengalpattu, Tamil Nadu', 12.6105000, 80.0550000, '603109'),
(23, 'Mahabalipuram / Mamallapuram', 'East Coast Road, Chengalpattu, Tamil Nadu', 12.6269000, 80.1927000, '603104'),
(23, 'Madurantakam', 'GST Highway, Chengalpattu, Tamil Nadu', 12.5090000, 79.8850000, '603306'),
(23, 'Urapakkam', 'GST Road, Chengalpattu, Tamil Nadu', 12.8670000, 80.0710000, '603210'),
(23, 'Kelambakkam', 'OMR Junction, Chengalpattu, Tamil Nadu', 12.7880000, 80.2190000, '603103'),

-- 1: Salem
(1, 'Salem Junction Railway Station', 'Suramangalam, Salem, Tamil Nadu', 11.6643000, 78.1460000, '636005'),
(1, 'Five Roads Meyyanur', 'Five Roads Junction, Salem, Tamil Nadu', 11.6710000, 78.1380000, '636004'),
(1, 'Ammapet', 'Ammapet Main Road, Salem, Tamil Nadu', 11.6520000, 78.1750000, '636003'),
(1, 'Fairlands', 'Brindavan Road, Salem, Tamil Nadu', 11.6780000, 78.1480000, '636016'),
(1, 'Hasthampatti', 'Yercaud Main Road, Salem, Tamil Nadu', 11.6850000, 78.1620000, '636007'),
(1, 'Suramangalam', 'Salem West, Salem, Tamil Nadu', 11.6680000, 78.1350000, '636005'),
(1, 'Shevapet', 'Bazaar Area, Salem, Tamil Nadu', 11.6550000, 78.1420000, '636002'),
(1, 'Gugai', 'Trichy Main Road, Salem, Tamil Nadu', 11.6420000, 78.1580000, '636006'),
(1, 'Alagapuram', 'Meyyanur Road, Salem, Tamil Nadu', 11.6820000, 78.1420000, '636004'),
(1, 'Omalur', 'Omalur Bypass, Salem, Tamil Nadu', 11.7420000, 78.0410000, '636455'),

-- 11: Chennai
(11, 'Anna Nagar', '2nd Avenue, Chennai, Tamil Nadu', 13.0850000, 80.2150000, '600040'),
(11, 'T. Nagar Pondy Bazaar', 'Pondy Bazaar, Chennai, Tamil Nadu', 13.0410000, 80.2340000, '600017'),
(11, 'Adyar', 'Lattice Bridge Road, Chennai, Tamil Nadu', 13.0012000, 80.2565000, '600020'),
(11, 'Velachery', 'Velachery Bypass, Chennai, Tamil Nadu', 12.9750000, 80.2210000, '600042'),
(11, 'Mylapore', 'Luz Corner, Chennai, Tamil Nadu', 13.0368000, 80.2676000, '600004'),
(11, 'Guindy', 'Kathipara Junction, Chennai, Tamil Nadu', 13.0067000, 80.2025000, '600032'),
(11, 'Nungambakkam', 'High Road, Chennai, Tamil Nadu', 13.0569000, 80.2425000, '600034'),
(11, 'Chennai Central Railway Station', 'Park Town, Chennai, Tamil Nadu', 13.0827000, 80.2707000, '600003'),
(11, 'Tambaram', 'GST Road, Chennai, Tamil Nadu', 12.9249000, 80.1275000, '600045'),
(11, 'Porur', 'Mount Poonamallee Road, Chennai, Tamil Nadu', 13.0382000, 80.1565000, '600116'),

-- 12: Coimbatore
(12, 'Gandhipuram Cross Cut Road', 'Gandhipuram, Coimbatore, Tamil Nadu', 11.0168000, 76.9658000, '641012'),
(12, 'RS Puram DB Road', 'RS Puram, Coimbatore, Tamil Nadu', 11.0080000, 76.9450000, '641002'),
(12, 'Peelamedu Avinashi Road', 'Peelamedu, Coimbatore, Tamil Nadu', 11.0280000, 77.0120000, '641004'),
(12, 'Saibaba Colony', 'NSR Road, Coimbatore, Tamil Nadu', 11.0250000, 76.9430000, '641011'),
(12, 'Town Hall', 'Oppanakara Street, Coimbatore, Tamil Nadu', 10.9960000, 76.9620000, '641001'),
(12, 'Coimbatore Junction', 'Railway Station Road, Coimbatore, Tamil Nadu', 10.9980000, 76.9670000, '641018'),
(12, 'Saravanampatti', 'Sathy Road, Coimbatore, Tamil Nadu', 11.0790000, 76.9970000, '641035'),
(12, 'Singanallur', 'Trichy Road, Coimbatore, Tamil Nadu', 10.9990000, 77.0260000, '641005'),
(12, 'Ukkadam Bus Stand', 'Ukkadam, Coimbatore, Tamil Nadu', 10.9880000, 76.9580000, '641001'),
(12, 'Ganapathy', 'Sathy Main Road, Coimbatore, Tamil Nadu', 11.0390000, 76.9780000, '641006'),

-- 13: Madurai
(13, 'Meenakshi Temple West Tower', 'West Masi Street, Madurai, Tamil Nadu', 9.9195000, 78.1193000, '625001'),
(13, 'KK Nagar 80 Feet Road', 'KK Nagar, Madurai, Tamil Nadu', 9.9320000, 78.1480000, '625020'),
(13, 'Mattuthavani Integrated Bus Stand', 'Mattuthavani, Madurai, Tamil Nadu', 9.9480000, 78.1620000, '625007'),
(13, 'Simmakkal', 'North Veli Street, Madurai, Tamil Nadu', 9.9280000, 78.1250000, '625001'),
(13, 'Goripalayam Junction', 'Goripalayam, Madurai, Tamil Nadu', 9.9310000, 78.1320000, '625002'),
(13, 'Anna Nagar Madurai', 'Anna Nagar, Madurai, Tamil Nadu', 9.9210000, 78.1520000, '625020'),
(13, 'Thiruparankundram', 'Temple Town, Madurai, Tamil Nadu', 9.8820000, 78.0850000, '625005'),
(13, 'Madurai Junction Railway Station', 'Railway Colony, Madurai, Tamil Nadu', 9.9170000, 78.1120000, '625001'),
(13, 'Teppakulam', 'Vandiyur Teppakulam, Madurai, Tamil Nadu', 9.9120000, 78.1510000, '625009'),
(13, 'Sellur', 'Sellur Main Road, Madurai, Tamil Nadu', 9.9380000, 78.1210000, '625002'),

-- 2: Trichy
(2, 'Central Bus Stand Trichy', 'Cantonment, Trichy, Tamil Nadu', 10.7905000, 78.7047000, '620001'),
(2, 'Thillai Nagar Main Road', 'Thillai Nagar, Trichy, Tamil Nadu', 10.8280000, 78.6890000, '620018'),
(2, 'Srirangam Temple View', 'Srirangam, Trichy, Tamil Nadu', 10.8620000, 78.6980000, '620006'),
(2, 'Cantonment', 'Collector Office Road, Trichy, Tamil Nadu', 10.8010000, 78.6880000, '620001'),
(2, 'Rockfort Main Guard Gate', 'Rockfort, Trichy, Tamil Nadu', 10.8270000, 78.6970000, '620002'),
(2, 'KK Nagar Trichy', 'Sundar Nagar, Trichy, Tamil Nadu', 10.7680000, 78.7050000, '620021'),
(2, 'Trichy Junction Railway Station', 'Junction Area, Trichy, Tamil Nadu', 10.7950000, 78.6920000, '620001'),
(2, 'Woraiyur', 'Salai Road, Trichy, Tamil Nadu', 10.8220000, 78.6750000, '620003'),
(2, 'Ponmalai Golden Rock', 'Golden Rock, Trichy, Tamil Nadu', 10.7850000, 78.7250000, '620004'),
(2, 'BHEL Township', 'Thuvakudi, Trichy, Tamil Nadu', 10.7820000, 78.7850000, '620014'),

-- 3: Thanjavur
(3, 'Old Bus Stand South Rampart', 'South Rampart, Thanjavur, Tamil Nadu', 10.7870000, 79.1378000, '613001'),
(3, 'Medical College Road', 'Medical College, Thanjavur, Tamil Nadu', 10.7650000, 79.1120000, '613004'),
(3, 'Brihadeeswarar Big Temple Area', 'West Main Street, Thanjavur, Tamil Nadu', 10.7828000, 79.1318000, '613007'),
(3, 'New Bus Stand Thanjavur', 'Trichy Bypass, Thanjavur, Tamil Nadu', 10.7620000, 79.1220000, '613005'),
(3, 'Palliagraharam', 'Kumbakonam Road, Thanjavur, Tamil Nadu', 10.8120000, 79.1550000, '613003'),
(3, 'Karanthai', 'North Main Street, Thanjavur, Tamil Nadu', 10.8010000, 79.1420000, '613002'),
(3, 'Thanjavur Junction Railway Station', 'Station Road, Thanjavur, Tamil Nadu', 10.7780000, 79.1350000, '613001'),
(3, 'Vallam', 'Pudukkottai Highway, Thanjavur, Tamil Nadu', 10.7180000, 79.0550000, '613403'),
(3, 'Marys Corner', 'South Main Street, Thanjavur, Tamil Nadu', 10.7720000, 79.1380000, '613001'),
(3, 'Raja Serfoji College Road', 'New Bus Stand Area, Thanjavur, Tamil Nadu', 10.7690000, 79.1280000, '613005'),

-- 22: Kanchipuram
(22, 'Gandhi Road Kanchipuram', 'Gandhi Road, Kanchipuram, Tamil Nadu', 12.8342000, 79.7036000, '631501'),
(22, 'Sannathi Street Varadharajar', 'Sannathi Street, Kanchipuram, Tamil Nadu', 12.8265000, 79.6965000, '631501'),
(22, 'Ennaikaran Street', 'Silk Town, Kanchipuram, Tamil Nadu', 12.8340000, 79.7040000, '631501'),
(22, 'Kanchipuram Bus Stand', 'Bus Stand Road, Kanchipuram, Tamil Nadu', 12.8380000, 79.7080000, '631502'),
(22, 'Kamakshi Amman Temple Sannathi', 'Kamakshi Nagar, Kanchipuram, Tamil Nadu', 12.8420000, 79.6980000, '631502'),
(22, 'Kanchipuram Railway Station', 'Station Road, Kanchipuram, Tamil Nadu', 12.8450000, 79.7120000, '631501'),
(22, 'Walajabad Town', 'Chengalpattu Highway, Kanchipuram, Tamil Nadu', 12.7950000, 79.8250000, '631605'),
(22, 'Orikkai', 'Arakkonam Road, Kanchipuram, Tamil Nadu', 12.8120000, 79.6950000, '631502'),
(22, 'Sunguvarchatram', 'Chennai-Bangalore Highway, Kanchipuram, Tamil Nadu', 12.9250000, 79.8850000, '602106'),
(22, 'Uthiramerur', 'Heritage Belt, Kanchipuram, Tamil Nadu', 12.6150000, 79.7580000, '603406'),

-- 24: Tiruvallur
(24, 'Tiruvallur Junction Road', 'JN Road, Tiruvallur, Tamil Nadu', 13.1432000, 79.9079000, '602001'),
(24, 'Veeraraghava Swamy Temple Car St', 'Temple Street, Tiruvallur, Tamil Nadu', 13.1410000, 79.9110000, '602001'),
(24, 'Nemili Road', 'Nemili, Tiruvallur, Tamil Nadu', 13.1445000, 79.9145000, '602001'),
(24, 'Chennai-Tirupati Highway', 'Bypass Road, Tiruvallur, Tamil Nadu', 13.1365000, 79.9065000, '602001'),
(24, 'Poondi Lake Reservoir Area', 'Poondi Road, Tiruvallur, Tamil Nadu', 13.1850000, 79.8650000, '602023'),
(24, 'Tiruvallur Bus Stand', 'Market Road, Tiruvallur, Tamil Nadu', 13.1460000, 79.9120000, '602001'),
(24, 'Manavala Nagar', 'Poonamallee High Road, Tiruvallur, Tamil Nadu', 13.1250000, 79.9180000, '602002'),
(24, 'Sriperumbudur Trunk Road', 'Industrial Hub, Tiruvallur, Tamil Nadu', 12.9750000, 79.9450000, '602105'),
(24, 'Kadambathur', 'Railway Station Road, Tiruvallur, Tamil Nadu', 13.0980000, 79.8650000, '631203'),
(24, 'Sevvapet Road', 'Chennai Suburban Belt, Tiruvallur, Tamil Nadu', 13.1320000, 79.9750000, '602025'),

-- 15: Tirunelveli
(15, 'Nellaiyappar Temple East Car Street', 'Tirunelveli Town, Tirunelveli, Tamil Nadu', 8.7280000, 77.6890000, '627006'),
(15, 'Palayamkottai Bus Stand Market', 'Palayamkottai, Tirunelveli, Tamil Nadu', 8.7180000, 77.7420000, '627002'),
(15, 'Vannarpettai Main Road', 'Vannarpettai, Tirunelveli, Tamil Nadu', 8.7350000, 77.7210000, '627003'),
(15, 'Tirunelveli Junction Railway Station', 'Junction Main Road, Tirunelveli, Tamil Nadu', 8.7320000, 77.7120000, '627001'),
(15, 'High Ground Palayamkottai', 'Medical College Road, Tirunelveli, Tamil Nadu', 8.7110000, 77.7550000, '627011'),
(15, 'Melapalayam', 'Bazaar Area, Tirunelveli, Tamil Nadu', 8.7050000, 77.7150000, '627005'),
(15, 'Pettai Industrial Estate', 'Pettai, Tirunelveli, Tamil Nadu', 8.7450000, 77.6680000, '627004'),
(15, 'Maharaja Nagar', 'Palayamkottai, Tirunelveli, Tamil Nadu', 8.7220000, 77.7610000, '627011'),
(15, 'Thachanallur', 'Madurai Highway, Tirunelveli, Tamil Nadu', 8.7520000, 77.7280000, '627002'),
(15, 'Samathanapuram', 'Palayamkottai, Tirunelveli, Tamil Nadu', 8.7150000, 77.7380000, '627002'),

-- 16: Erode
(16, 'Brough Road Clock Tower', 'Brough Road, Erode, Tamil Nadu', 11.3410000, 77.7280000, '638001'),
(16, 'Central Bus Stand Erode', 'Sathy Road, Erode, Tamil Nadu', 11.3380000, 77.7190000, '638002'),
(16, 'Erode Junction Railway Station', 'Station Road, Erode, Tamil Nadu', 11.3310000, 77.7210000, '638002'),
(16, 'Perundurai Bypass Road', 'Perundurai, Erode, Tamil Nadu', 11.3150000, 77.6820000, '638052'),
(16, 'Bhavani River View', 'Bhavani Main Road, Erode, Tamil Nadu', 11.4480000, 77.6820000, '638301'),
(16, 'Veerappanchatram', 'Sathy Main Road, Erode, Tamil Nadu', 11.3620000, 77.7150000, '638004'),
(16, 'Thindal Murugan Temple Road', 'Perundurai Road, Erode, Tamil Nadu', 11.3280000, 77.6850000, '638012'),
(16, 'Surampatti Four Roads', 'Surampatti, Erode, Tamil Nadu', 11.3220000, 77.7150000, '638009'),
(16, 'Karungalpalayam', 'Cauvery Road, Erode, Tamil Nadu', 11.3480000, 77.7450000, '638003'),
(16, 'Solar Transport Nagar', 'Karur Highway, Erode, Tamil Nadu', 11.3180000, 77.7520000, '638002'),

-- 17: Vellore
(17, 'Anna Salai Vellore Fort', 'Anna Salai, Vellore, Tamil Nadu', 12.9250000, 79.1320000, '632004'),
(17, 'Katpadi Junction Railway Station', 'Katpadi Main Road, Vellore, Tamil Nadu', 12.9650000, 79.1410000, '632014'),
(17, 'Bagayam CMC Campus Road', 'Bagayam, Vellore, Tamil Nadu', 12.8750000, 79.1280000, '632002'),
(17, 'Sathuvachari Phase 1', 'Arcot Road, Vellore, Tamil Nadu', 12.9350000, 79.1650000, '632009'),
(17, 'New Bus Stand Vellore', 'Katpadi Road, Vellore, Tamil Nadu', 12.9380000, 79.1420000, '632004'),
(17, 'Gandhi Nagar Katpadi', 'East Main Road, Vellore, Tamil Nadu', 12.9550000, 79.1380000, '632006'),
(17, 'Thorapadi Jail Road', 'Thorapadi, Vellore, Tamil Nadu', 12.9050000, 79.1150000, '632002'),
(17, 'Sankaranpalayam', 'Otteri Road, Vellore, Tamil Nadu', 12.9150000, 79.1220000, '632001'),
(17, 'VIT University Campus Area', 'Katpadi, Vellore, Tamil Nadu', 12.9690000, 79.1550000, '632014'),
(17, 'Salavanpet', 'Bangalore Road, Vellore, Tamil Nadu', 12.9180000, 79.1280000, '632001'),

-- 18: Tiruppur
(18, 'Kumaran Road Railway Station', 'Kumaran Road, Tiruppur, Tamil Nadu', 11.1085000, 77.3410000, '641601'),
(18, 'Avinashi Main Road', 'Avinashi Road, Tiruppur, Tamil Nadu', 11.1250000, 77.3220000, '641603'),
(18, 'Palladam Main Road', 'Palladam, Tiruppur, Tamil Nadu', 11.0050000, 77.2850000, '641664'),
(18, 'Old Bus Stand Tiruppur', 'Town Hall Area, Tiruppur, Tamil Nadu', 11.1040000, 77.3450000, '641604'),
(18, 'New Bus Stand Tiruppur', 'Pushpa Theater Area, Tiruppur, Tamil Nadu', 11.1210000, 77.3550000, '641602'),
(18, 'Rayapuram', 'Cotton Market, Tiruppur, Tamil Nadu', 11.1120000, 77.3380000, '641601'),
(18, 'Kangeyam Cross Road', 'Nallur, Tiruppur, Tamil Nadu', 11.0950000, 77.3620000, '641604'),
(18, 'Dharapuram Road', 'KNP Colony, Tiruppur, Tamil Nadu', 11.0850000, 77.3520000, '641608'),
(18, 'Veerapandi', 'Palladam Road, Tiruppur, Tamil Nadu', 11.0720000, 77.3680000, '641605'),
(18, 'Anupparpalayam', 'Avinashi Highway, Tiruppur, Tamil Nadu', 11.1550000, 77.3180000, '641652'),

-- 14: Dindigul
(14, 'Palani Road Commercial Center', 'Palani Road, Dindigul, Tamil Nadu', 10.3650000, 77.9750000, '624001'),
(14, 'Clock Tower Main Bazaar', 'Main Bazaar, Dindigul, Tamil Nadu', 10.3610000, 77.9820000, '624002'),
(14, 'Dindigul Bus Stand Complex', 'Trichy Road, Dindigul, Tamil Nadu', 10.3680000, 77.9780000, '624001'),
(14, 'Dindigul Junction Station', 'Station Road, Dindigul, Tamil Nadu', 10.3580000, 77.9690000, '624003'),
(14, 'Batlagundu Town', 'Kodaikanal Ghat Road, Dindigul, Tamil Nadu', 10.1650000, 77.7650000, '624202'),
(14, 'Palani Hill Temple Foot', 'Adivaram, Dindigul, Tamil Nadu', 10.4520000, 77.5180000, '624601'),
(14, 'Begambur Big Mosque Area', 'Madurai Road, Dindigul, Tamil Nadu', 10.3550000, 77.9850000, '624002'),
(14, 'Sirumalai Road Sanarpatti', 'Sirumalai Road, Dindigul, Tamil Nadu', 10.3350000, 77.9250000, '624005'),
(14, 'GTN Arts College Area', 'Karur Highway, Dindigul, Tamil Nadu', 10.3420000, 77.9620000, '624005'),
(14, 'Oddanchatram Vegetable Market', 'Dharapuram Road, Dindigul, Tamil Nadu', 10.4850000, 77.7450000, '624619'),

-- 19: Namakkal
(19, 'Anjaneyar Temple Street', 'Temple Road, Namakkal, Tamil Nadu', 11.2189000, 78.1674000, '637001'),
(19, 'Mohanur Road', 'Mohanur Road, Namakkal, Tamil Nadu', 11.2050000, 78.1750000, '637002'),
(19, 'Sendamangalam Road Kolli Belt', 'Sendamangalam, Namakkal, Tamil Nadu', 11.2350000, 78.1820000, '637001'),
(19, 'Namakkal Bus Stand', 'Salem Road, Namakkal, Tamil Nadu', 11.2220000, 78.1640000, '637001'),
(19, 'Paramathi Velur', 'Cauvery River Belt, Namakkal, Tamil Nadu', 11.0450000, 78.0120000, '638182'),
(19, 'Tiruchengode Arthanareeswarar', 'Hill Temple Road, Namakkal, Tamil Nadu', 11.3810000, 77.8960000, '637211'),
(19, 'Rasipuram Town', 'Attur Road, Namakkal, Tamil Nadu', 11.4580000, 78.1750000, '637408'),
(19, 'Kolli Hills Semmedu', 'Kolli Hills, Namakkal, Tamil Nadu', 11.2850000, 78.2320000, '637409'),
(19, 'Mudalaipatti Bypass', 'Trichy Road, Namakkal, Tamil Nadu', 11.1950000, 78.1880000, '637003'),
(19, 'Kallankurichi', 'Mohanur Belt, Namakkal, Tamil Nadu', 11.1820000, 78.1650000, '637014'),

-- 20: Karur
(20, 'Jawahar Bazaar Temple Road', 'Jawahar Bazaar, Karur, Tamil Nadu', 10.9601000, 78.0766000, '639001'),
(20, 'Vengamedu North', 'Vengamedu Road, Karur, Tamil Nadu', 10.9750000, 78.0620000, '639006'),
(20, 'Pasupathipalayam Industrial Area', 'Erode Highway, Karur, Tamil Nadu', 10.9420000, 78.0950000, '639004'),
(20, 'Karur Bus Stand', 'Kovai Road, Karur, Tamil Nadu', 10.9580000, 78.0820000, '639001'),
(20, 'Karur Junction Railway Station', 'Station Road, Karur, Tamil Nadu', 10.9650000, 78.0720000, '639001'),
(20, 'Thanthonimalai Kalyana Venkataramana', 'Dindigul Road, Karur, Tamil Nadu', 10.9250000, 78.0850000, '639005'),
(20, 'Velayuthampalayam TNPL', 'TNPL Paper Mills Area, Karur, Tamil Nadu', 11.0550000, 78.0120000, '639117'),
(20, 'Kulithalai Town', 'Trichy Road, Karur, Tamil Nadu', 10.9350000, 78.4150000, '639107'),
(20, 'Aravakurichi', 'Dharapuram Road, Karur, Tamil Nadu', 10.7720000, 77.9150000, '639201'),
(20, 'Gandhigramam', 'South Gandhigramam, Karur, Tamil Nadu', 10.9480000, 78.0650000, '639004'),

-- 4: Theni
(4, 'Theni Old Bus Stand', 'Cumbum Road, Theni, Tamil Nadu', 10.0104000, 77.4768000, '625531'),
(4, 'Periyakulam Bazaar', 'Bazaar Street, Theni, Tamil Nadu', 10.0350000, 77.5120000, '625532'),
(4, 'Cumbum Valley Road', 'Cumbum, Theni, Tamil Nadu', 9.9850000, 77.4320000, '625513'),
(4, 'Bodinayakanur Cardamom Market', 'Cardamom Belt, Theni, Tamil Nadu', 10.0120000, 77.3520000, '625513'),
(4, 'Theni New Bus Stand', 'Madurai Highway, Theni, Tamil Nadu', 10.0180000, 77.4850000, '625531'),
(4, 'Chinnamanur Suruli Junction', 'Suruli Falls Road, Theni, Tamil Nadu', 9.8420000, 77.3850000, '625515'),
(4, 'Allinagaram', 'Allinagaram Main Road, Theni, Tamil Nadu', 10.0050000, 77.4680000, '625531'),
(4, 'Uthamapalayam Town', 'Periyar River Belt, Theni, Tamil Nadu', 9.8080000, 77.3320000, '625533'),
(4, 'Andipatti', 'Vaigai Dam Road, Theni, Tamil Nadu', 9.9850000, 77.6250000, '625512'),
(4, 'Lakshmipuram', 'Periyakulam Road, Theni, Tamil Nadu', 10.0250000, 77.5350000, '625523'),

-- 5: Kanyakumari
(5, 'Clock Tower Nagercoil', 'Tower Junction, Kanyakumari, Tamil Nadu', 8.1833000, 77.4119000, '629001'),
(5, 'Sunset Point Road Kanyakumari', 'Sunset Point, Kanyakumari, Tamil Nadu', 8.0880000, 77.5385000, '629702'),
(5, 'Marthandam Hospital Junction', 'Main Road, Kanyakumari, Tamil Nadu', 8.3050000, 77.2180000, '629165'),
(5, 'Vadasery Bus Stand Nagercoil', 'Vadasery, Kanyakumari, Tamil Nadu', 8.1920000, 77.4250000, '629001'),
(5, 'Thuckalay Town', 'Padmanabhapuram Palace Road, Kanyakumari, Tamil Nadu', 8.2520000, 77.3250000, '629175'),
(5, 'Colachel Harbour Area', 'Coastal Belt, Kanyakumari, Tamil Nadu', 8.1750000, 77.2550000, '629251'),
(5, 'Nagercoil Junction Railway Station', 'Railway Station Road, Kanyakumari, Tamil Nadu', 8.1780000, 77.4320000, '629002'),
(5, 'Suchindram Thanumalayan Temple', 'Suchindram, Kanyakumari, Tamil Nadu', 8.1550000, 77.4650000, '629704'),
(5, 'Kanyakumari Main Beach Road', 'Beach Road, Kanyakumari, Tamil Nadu', 8.0820000, 77.5450000, '629702'),
(5, 'Karungal Town', 'Monday Market Road, Kanyakumari, Tamil Nadu', 8.2250000, 77.2420000, '629157'),

-- 6: Karaikudi
(6, 'New Bus Stand Karaikudi', 'Commercial Street, Karaikudi, Tamil Nadu', 10.0732000, 78.7675000, '630001'),
(6, 'Sekkalai Road', 'Sekkalai, Karaikudi, Tamil Nadu', 10.0650000, 78.7820000, '630002'),
(6, 'Kottaiyur Palace Mess Road', 'Kottaiyur, Karaikudi, Tamil Nadu', 10.1150000, 78.7520000, '630106'),
(6, 'Alagappa University Campus', 'College Road, Karaikudi, Tamil Nadu', 10.0780000, 78.7750000, '630003'),
(6, 'Subramaniyapuram', 'Subramaniyapuram Main Rd, Karaikudi, Tamil Nadu', 10.0620000, 78.7710000, '630002'),
(6, 'Karaikudi Junction Railway Station', 'Station Road, Karaikudi, Tamil Nadu', 10.0680000, 78.7610000, '630001'),
(6, 'Senjai Bazaar', 'Senjai, Karaikudi, Tamil Nadu', 10.0580000, 78.7850000, '630001'),
(6, 'Devakottai Town', 'Devakottai Road, Karaikudi, Tamil Nadu', 9.9520000, 78.8250000, '630302'),
(6, 'Kanadukathan Chettinad Mansions', 'Heritage Village, Karaikudi, Tamil Nadu', 10.1450000, 78.7850000, '630103'),
(6, 'Pallathur', 'Main Road, Karaikudi, Tamil Nadu', 10.1650000, 78.7950000, '630107'),

-- 7: Pollachi
(7, 'Pollachi Market Road', 'Market Road, Pollachi, Tamil Nadu', 10.6609000, 77.0087000, '642001'),
(7, 'Mahalingapuram Main Street', 'Mahalingapuram, Pollachi, Tamil Nadu', 10.6750000, 77.0250000, '642002'),
(7, 'Anaimalai Highway', 'Anaimalai Road, Pollachi, Tamil Nadu', 10.5850000, 76.9320000, '642104'),
(7, 'Pollachi Central Bus Stand', 'New Bus Stand Area, Pollachi, Tamil Nadu', 10.6580000, 77.0050000, '642001'),
(7, 'Pollachi Junction Railway Station', 'Railway Line, Pollachi, Tamil Nadu', 10.6650000, 77.0120000, '642001'),
(7, 'Venkatesa Colony', 'Udumalai Road, Pollachi, Tamil Nadu', 10.6680000, 77.0190000, '642001'),
(7, 'Kinathukadavu Town', 'Coimbatore Highway, Pollachi, Tamil Nadu', 10.8250000, 77.0180000, '642109'),
(7, 'Topslip Wildlife Entrance', 'Anamalai Tiger Reserve, Pollachi, Tamil Nadu', 10.4850000, 76.8520000, '642140'),
(7, 'Kottur', 'Sethumadai Road, Pollachi, Tamil Nadu', 10.5420000, 76.9850000, '642114'),
(7, 'Unjavelampatti', 'Palani Highway, Pollachi, Tamil Nadu', 10.6850000, 77.0450000, '642003'),

-- 8: Ooty
(8, 'Ooty Lake View Entrance', 'Ooty Lake Road, Ooty, Tamil Nadu', 11.4102000, 76.6950000, '643001'),
(8, 'Charing Cross Commercial Road', 'Commercial Road, Ooty, Tamil Nadu', 11.4160000, 76.7080000, '643001'),
(8, 'Ketti Valley Panoramic Road', 'Ketti Valley, Ooty, Tamil Nadu', 11.3780000, 76.7350000, '643215'),
(8, 'Government Botanical Garden Area', 'Vannarapettai, Ooty, Tamil Nadu', 11.4210000, 76.7120000, '643001'),
(8, 'Ooty Bus Stand Complex', 'Main Bus Stand, Ooty, Tamil Nadu', 11.4080000, 76.7010000, '643001'),
(8, 'Coonoor Sim Park Area', 'Bedford, Ooty, Tamil Nadu', 11.3520000, 76.7950000, '643101'),
(8, 'Kotagiri Johnston Square', 'Kotagiri, Ooty, Tamil Nadu', 11.4250000, 76.8820000, '643217'),
(8, 'Fingerpost Gudalur Road', 'Fingerpost, Ooty, Tamil Nadu', 11.4220000, 76.6850000, '643006'),
(8, 'Lovedale Lawrence School Area', 'Lovedale, Ooty, Tamil Nadu', 11.3850000, 76.7150000, '643003'),
(8, 'Fernhill Palace Area', 'Fernhill, Ooty, Tamil Nadu', 11.3980000, 76.6880000, '643004'),

-- 9: Ambur
(9, 'Ambur Bazaar Main Street', 'Ambur Bazaar, Ambur, Tamil Nadu', 12.7900000, 78.7160000, '635802'),
(9, 'NH48 Chennai-Bangalore Bypass', 'Service Road, Ambur, Tamil Nadu', 12.7980000, 78.7280000, '635802'),
(9, 'Pernambut Highway', 'Pernambut Road, Ambur, Tamil Nadu', 12.7650000, 78.6920000, '635810'),
(9, 'Ambur Railway Station', 'Railway Feeder Road, Ambur, Tamil Nadu', 12.7880000, 78.7120000, '635802'),
(9, 'Ambur Bus Stand', 'MC Road, Ambur, Tamil Nadu', 12.7920000, 78.7210000, '635802'),
(9, 'Reddy Thoppu', 'Leather Belt, Ambur, Tamil Nadu', 12.7950000, 78.7190000, '635802'),
(9, 'Thuthipet Industrial Area', 'Thuthipet, Ambur, Tamil Nadu', 12.7750000, 78.7050000, '635811'),
(9, 'Vaniyambadi Bypass', 'Vaniyambadi Road, Ambur, Tamil Nadu', 12.7680000, 78.6550000, '635751'),
(9, 'Alangayam Forest Belt', 'Alangayam Road, Ambur, Tamil Nadu', 12.7350000, 78.7450000, '635701'),
(9, 'Palikonda Toll Plaza', 'Palikonda, Ambur, Tamil Nadu', 12.8250000, 78.7850000, '635809'),

-- 10: Tiruvannamalai
(10, 'Arunachaleswarar East Sannadhi', 'East Sannadhi Street, Tiruvannamalai, Tamil Nadu', 12.2253000, 79.0747000, '606601'),
(10, 'Girivalam Inner Ring Road', 'Girivalam Path, Tiruvannamalai, Tamil Nadu', 12.2410000, 79.0520000, '606603'),
(10, 'Polur Main Highway', 'Polur Road, Tiruvannamalai, Tamil Nadu', 12.2350000, 79.0890000, '606602'),
(10, 'Tiruvannamalai Central Bus Stand', 'Bus Stand Area, Tiruvannamalai, Tamil Nadu', 12.2280000, 79.0680000, '606601'),
(10, 'Tiruvannamalai Railway Station', 'Station Road, Tiruvannamalai, Tamil Nadu', 12.2310000, 79.0790000, '606601'),
(10, 'Sri Ramana Ashramam Area', 'Chengam Road, Tiruvannamalai, Tamil Nadu', 12.2320000, 79.0550000, '606603'),
(10, 'Vengikkal Collectorate Area', 'Vengikkal, Tiruvannamalai, Tamil Nadu', 12.2580000, 79.0680000, '606604'),
(10, 'Avalurpet Road', 'Avalurpet Road, Tiruvannamalai, Tamil Nadu', 12.2520000, 79.0850000, '606604'),
(10, 'Tindivanam Highway Junction', 'Tindivanam Road, Tiruvannamalai, Tamil Nadu', 12.2380000, 79.1020000, '606601'),
(10, 'Manalurpet Road', 'Manalurpet Road, Tiruvannamalai, Tamil Nadu', 12.2150000, 79.0650000, '606601'),

-- 21: Hosur
(21, 'Hosur SIPCOT Phase 1 Industrial Area', 'Bangalore Highway, Hosur, Tamil Nadu', 12.7409000, 77.8253000, '635126'),
(21, 'Bagalur Road Ring Road Junction', 'Bagalur Road, Hosur, Tamil Nadu', 12.7550000, 77.8420000, '635109'),
(21, 'Denkanikottai Thally Highway', 'Denkanikottai, Hosur, Tamil Nadu', 12.5250000, 77.7850000, '635107'),
(21, 'Hosur Central Bus Stand', 'National Highway, Hosur, Tamil Nadu', 12.7350000, 77.8310000, '635109'),
(21, 'Hosur Railway Station', 'Railway Station Road, Hosur, Tamil Nadu', 12.7280000, 77.8220000, '635109'),
(21, 'Rayakottai Road', 'Rayakottai Road, Hosur, Tamil Nadu', 12.7150000, 77.8450000, '635109'),
(21, 'Mathigiri Cattle Farm Area', 'Mathigiri, Hosur, Tamil Nadu', 12.7120000, 77.8180000, '635110'),
(21, 'Zuzuvadi Attibele Border', 'Bangalore Border, Hosur, Tamil Nadu', 12.7650000, 77.7950000, '635126'),
(21, 'Avalapalli Dam Road', 'Avalapalli, Hosur, Tamil Nadu', 12.7480000, 77.8550000, '635109'),
(21, 'Mookandapalli', 'SIPCOT Area, Hosur, Tamil Nadu', 12.7480000, 77.8120000, '635126'),

-- 25: Villupuram
(25, 'Villupuram Old Bus Stand', 'Nehruji Road, Villupuram, Tamil Nadu', 11.9401000, 79.4861000, '605602'),
(25, 'Gingee Fort Royal Belt', 'Gingee Main Road, Villupuram, Tamil Nadu', 12.2520000, 79.4180000, '604202'),
(25, 'Tindivanam GST Road Food Plaza', 'GST Highway, Villupuram, Tamil Nadu', 12.2350000, 79.6520000, '604001'),
(25, 'Villupuram Junction Railway Station', 'Station Road, Villupuram, Tamil Nadu', 11.9380000, 79.4920000, '605602'),
(25, 'New Bus Stand Villupuram', 'Trichy Trunk Road, Villupuram, Tamil Nadu', 11.9480000, 79.4750000, '605602'),
(25, 'East Pondy Road', 'Puducherry Highway, Villupuram, Tamil Nadu', 11.9450000, 79.5120000, '605602'),
(25, 'Valavanur Town', 'Puducherry Road, Villupuram, Tamil Nadu', 11.9120000, 79.5850000, '605108'),
(25, 'Vikravandi Toll Gate', 'Chennai Highway, Villupuram, Tamil Nadu', 12.0350000, 79.5450000, '605652'),
(25, 'Marakkanam Beach Area', 'East Coast Road, Villupuram, Tamil Nadu', 12.1950000, 79.9450000, '604303'),
(25, 'Kandamangalam', 'Pondy Border, Villupuram, Tamil Nadu', 11.9220000, 79.6520000, '605102'),

-- 26: Ramanathapuram
(26, 'Sethupathi Palace Aranmanai Street', 'Aranmanai Street, Ramanathapuram, Tamil Nadu', 9.3639000, 78.8395000, '623501'),
(26, 'Rameswaram Temple Car Street', 'Ramanathaswamy Temple, Ramanathapuram, Tamil Nadu', 9.2880000, 79.3120000, '623526'),
(26, 'Kilakarai Coastal Belt', 'Coastal Road, Ramanathapuram, Tamil Nadu', 9.2350000, 78.7850000, '623517'),
(26, 'Ramanathapuram Bus Stand', 'Madurai Road, Ramanathapuram, Tamil Nadu', 9.3710000, 78.8320000, '623501'),
(26, 'Ramanathapuram Railway Station', 'Station Road, Ramanathapuram, Tamil Nadu', 9.3650000, 78.8450000, '623501'),
(26, 'Paramakudi Town', 'Vaigai River Bed, Ramanathapuram, Tamil Nadu', 9.5420000, 78.5880000, '623707'),
(26, 'Mandapam Pamban Bridge Area', 'Pamban Channel, Ramanathapuram, Tamil Nadu', 9.2780000, 79.1250000, '623518'),
(26, 'Dhanushkodi Point', 'Arichal Munai, Ramanathapuram, Tamil Nadu', 9.1780000, 79.4150000, '623526'),
(26, 'Mudukulathur Town', 'Kamuthi Road, Ramanathapuram, Tamil Nadu', 9.3420000, 78.5120000, '623704'),
(26, 'Sayalgudi', 'Tuticorin Highway, Ramanathapuram, Tamil Nadu', 9.1950000, 78.3450000, '623120'),

-- 27: Pudukkottai
(27, 'Main Bazaar Santhanathapuram', 'Main Bazaar, Pudukkottai, Tamil Nadu', 10.3833000, 78.8001000, '622001'),
(27, 'Sittannavasal Heritage Cave Area', 'Sittannavasal Road, Pudukkottai, Tamil Nadu', 10.4550000, 78.7250000, '622101'),
(27, 'Aranthangi Pattukkottai Highway', 'Aranthangi, Pudukkottai, Tamil Nadu', 10.1650000, 78.9950000, '614616'),
(27, 'Pudukkottai New Bus Stand', 'Trichy Highway, Pudukkottai, Tamil Nadu', 10.3750000, 78.8120000, '622001'),
(27, 'Pudukkottai Railway Station', 'Station Road, Pudukkottai, Tamil Nadu', 10.3890000, 78.8180000, '622001'),
(27, 'Thirumayam Fort View', 'Karaikudi Road, Pudukkottai, Tamil Nadu', 10.2450000, 78.7550000, '622507'),
(27, 'Illuppur Town', 'Manapparai Road, Pudukkottai, Tamil Nadu', 10.5120000, 78.6320000, '622102'),
(27, 'Alangudi', 'Pattukkottai Road, Pudukkottai, Tamil Nadu', 10.3550000, 78.9820000, '622301'),
(27, 'Ponnamaravathi', 'Madurai Road, Pudukkottai, Tamil Nadu', 10.2350000, 78.5250000, '622407'),
(27, 'Machuvadi', 'Thanjavur Highway, Pudukkottai, Tamil Nadu', 10.3680000, 78.8250000, '622004');
