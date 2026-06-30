package com.app.start_app.food;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantDAO restaurantDAO;

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
}
