package com.app.start_app.grocery;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class GroceryProductController {

    private final GroceryProductDAO groceryProductDAO;

    public GroceryProductController(GroceryProductDAO groceryProductDAO) {
        this.groceryProductDAO = groceryProductDAO;
    }

    // GET GROCERY PRODUCTS
    @GetMapping("/api/grocery-products")
    public List<GroceryProduct> getGroceryProducts(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer storeId
    ) {
        return groceryProductDAO.getGroceryProducts(district, storeId);
    }

    // PLACE ORDER
    @PostMapping("/api/grocery-order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        groceryProductDAO.reduceStock(productId);
        return "Order placed successfully";
    }
}
