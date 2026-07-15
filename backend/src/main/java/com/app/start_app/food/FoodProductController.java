package com.app.start_app.food;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class FoodProductController {

    private final FoodProductDAO foodProductDAO;

    public FoodProductController(FoodProductDAO foodProductDAO) {
        this.foodProductDAO = foodProductDAO;
    }

    // GET PRODUCTS
    @GetMapping("/api/food-products")
    public List<FoodProduct> getFoodProducts(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer restaurantId
    ) {
        return foodProductDAO.getFoodProducts(district, restaurantId);
    }

    // PLACE ORDER
    @PostMapping("/api/order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        foodProductDAO.reduceStock(productId);
        return "Order placed successfully";
    }
}
