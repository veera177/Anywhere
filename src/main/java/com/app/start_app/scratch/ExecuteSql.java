package com.app.start_app.scratch;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ExecuteSql {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://localhost:3306/anywhere";
        String username = "root";
        String password = "sql205071";

        try {
            String content = new String(Files.readAllBytes(Paths.get("d:/springboot/start-app/start-app/database/triangular_restaurants.sql")));
            String[] queries = content.split(";");

            try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password);
                 Statement stmt = conn.createStatement()) {
                
                for (String query : queries) {
                    if (query.trim().isEmpty()) continue;
                    stmt.execute(query.trim());
                }
                System.out.println("Executed triangular_restaurants.sql successfully.");
                
                // Now update the delivery radius
                stmt.execute("UPDATE platform_settings SET setting_value = '20' WHERE setting_key = 'delivery.food.radius_km'");
                System.out.println("Updated delivery.food.radius_km to 20.");
                
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
