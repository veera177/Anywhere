package com.app.start_app.grocery;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class GroceryStoreController {

    private final GroceryStoreDAO groceryStoreDAO;

    public GroceryStoreController(GroceryStoreDAO groceryStoreDAO) {
        this.groceryStoreDAO = groceryStoreDAO;
    }

    // GET GROCERY STORES
    @GetMapping("/api/grocery-stores")
    public List<GroceryStore> getGroceryStores(
            @RequestParam(required = false) String district
    ) {
        return groceryStoreDAO.getGroceryStores(district);
    }
}
