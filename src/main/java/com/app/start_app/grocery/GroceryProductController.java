package com.app.start_app.grocery;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.app.start_app.user.ProfileDistrictService;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class GroceryProductController {

    private final GroceryProductDAO groceryProductDAO;
    private final ProfileDistrictService profileDistrictService;

    public GroceryProductController(GroceryProductDAO groceryProductDAO,
                                    ProfileDistrictService profileDistrictService) {
        this.groceryProductDAO = groceryProductDAO;
        this.profileDistrictService = profileDistrictService;
    }

    // GET GROCERY PRODUCTS — district comes from the profile, not the query string.
    @GetMapping("/api/grocery-products")
    public List<GroceryProduct> getGroceryProducts(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean inStock
    ) {
        String profileDistrict = profileDistrictService.requireDistrict(userId);
        return groceryProductDAO.getGroceryProducts(profileDistrict, storeId, name, inStock);
    }

    // PLACE ORDER
    @PostMapping("/api/grocery-order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        throw new ResponseStatusException(HttpStatus.GONE,
                "Direct ordering is unavailable. Add the item to cart and complete checkout.");
    }
}
