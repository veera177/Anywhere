package com.app.start_app.cart;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.app.start_app.security.CurrentUser;
import com.app.start_app.user.ProfileDistrictService;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final ProfileDistrictService profileDistrictService;

    public CartController(CartService cartService, ProfileDistrictService profileDistrictService) {
        this.cartService = cartService;
        this.profileDistrictService = profileDistrictService;
    }

    // Add item to cart — only shops in the user's profile district are allowed
    @PostMapping("/add")
    public String addToCart(@RequestBody Cart cart, @AuthenticationPrincipal Integer userId) {
        Integer currentUserId = CurrentUser.require(userId);
        cart.setUserId(currentUserId);

        String profileDistrict = profileDistrictService.requireDistrict(currentUserId);
        String shopDistrict = cartService.getShopDistrict(cart.getServiceType(), cart.getProductId());

        if (shopDistrict != null && !shopDistrict.equalsIgnoreCase(profileDistrict)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    profileDistrictService.shopDistrictMessage(profileDistrict)
            );
        }

        String result = cartService.addToCart(cart);

        switch (result) {

            case "ITEM_ADDED":
                return "Item Added to Cart";

            case "QUANTITY_UPDATED":
                return "Item Quantity Updated";

            case "OUT_OF_STOCK":
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This item is not available right now");

            default:
                return "Failed to Add Item";
        }
    }

    // Get cart items by user
    // Get cart items by user
    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);

        return cartService.getCart(userId);

    }

    // Update quantity
    @PutMapping("/update")
    public String updateQuantity(
            @RequestParam Integer cartId,
            @RequestParam Integer quantity, @AuthenticationPrincipal Integer userId) {
        requireCartOwner(cartId, userId);

        int result = cartService.updateQuantity(cartId, quantity);

        if (result > 0) {
            return "Quantity Updated";
        }

        return "Update Failed";
    }

    // Remove one item
    @DeleteMapping("/remove/{cartId}")
    public String removeItem(@PathVariable Integer cartId, @AuthenticationPrincipal Integer userId) {
        requireCartOwner(cartId, userId);

        int result = cartService.removeItem(cartId);

        if (result > 0) {
            return "Item Removed";
        }

        return "Remove Failed";
    }

    // Clear entire cart
    @DeleteMapping("/clear/{userId}")
    public String clearCart(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);

        int result = cartService.clearCart(userId);

        if (result > 0) {
            return "Cart Cleared";
        }

        return "Cart Already Empty";
    }

    private void requireCartOwner(Integer cartId, Integer userId) {
        Integer owner = cartService.getOwner(cartId);
        if (owner == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        CurrentUser.owns(userId, owner);
    }
}
