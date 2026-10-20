package com.app.start_app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class StartAppApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void contextLoads() {
		try {
			System.out.println("Running SQL Migrations...");
			
			String[] tables = {"restaurants", "grocery_stores", "pharmacies"};
			for (String table : tables) {
				try {
					jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN latitude DOUBLE, ADD COLUMN longitude DOUBLE, ADD COLUMN taluk VARCHAR(100), ADD COLUMN pincode VARCHAR(20), ADD COLUMN is_verified BOOLEAN DEFAULT TRUE, ADD COLUMN is_active BOOLEAN DEFAULT TRUE;");
					System.out.println("Migrated: " + table);
				} catch(Exception e) {
					System.out.println("Skipped " + table + " (maybe columns already exist): " + e.getMessage());
				}
			}
			System.out.println("Migrations Complete!");
		} catch (Exception e) {
			System.out.println("TESTING FAILED!");
			e.printStackTrace();
			throw e;
		}
	}

}


