package com.app.start_app.food;

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
public class FoodProductController {

    private final FoodProductDAO foodProductDAO;
    private final ProfileDistrictService profileDistrictService;

    public FoodProductController(FoodProductDAO foodProductDAO, ProfileDistrictService profileDistrictService) {
        this.foodProductDAO = foodProductDAO;
        this.profileDistrictService = profileDistrictService;
    }

    // GET PRODUCTS — the district always comes from the signed-in user's profile.
    // Any `district` query parameter sent by the browser is ignored.
    @GetMapping("/api/food-products")
    public List<FoodProduct> getFoodProducts(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(required = false) Integer restaurantId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean inStock
    ) {
        String profileDistrict = profileDistrictService.requireDistrict(userId);
        return foodProductDAO.getFoodProducts(profileDistrict, restaurantId, name, inStock);
    }

    // PLACE ORDER
    @PostMapping("/api/order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        throw new ResponseStatusException(HttpStatus.GONE,
                "Direct ordering is unavailable. Add the item to cart and complete checkout.");
    }
}
