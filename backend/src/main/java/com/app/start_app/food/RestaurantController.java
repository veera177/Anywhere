package com.app.start_app.food;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantDAO restaurantDAO;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public RestaurantController(RestaurantDAO restaurantDAO) {
        this.restaurantDAO = restaurantDAO;
    }

    // GET RESTAURANTS
    @GetMapping("/api/restaurants")
    public List<Restaurant> getRestaurants(
            @RequestParam(required = false) String district
    ) {
        return restaurantDAO.getRestaurants(district);
    }
    
    @GetMapping("/api/test/migrate")
    public String migrate() {
        try {
            String[] tables = {"restaurants", "grocery_stores", "pharmacies"};
            for (String table : tables) {
                try {
                    jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN latitude DOUBLE, ADD COLUMN longitude DOUBLE, ADD COLUMN taluk VARCHAR(100), ADD COLUMN pincode VARCHAR(20), ADD COLUMN is_verified BOOLEAN DEFAULT TRUE, ADD COLUMN is_active BOOLEAN DEFAULT TRUE;");
                } catch(Exception e) {
                    System.out.println("Skipped " + table + ": " + e.getMessage());
                }
            }
            return "Migration Successful!";
        } catch(Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
