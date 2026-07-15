package com.app.start_app.cart;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add item to cart
    @PostMapping("/add")
    public String addToCart(@RequestBody Cart cart) {

        String result = cartService.addToCart(cart);

        switch (result) {

            case "ITEM_ADDED":
                return "Item Added to Cart";

            case "QUANTITY_UPDATED":
                return "Item Quantity Updated";

            default:
                return "Failed to Add Item";
        }
    }

    // Get cart items by user
    // Get cart items by user
    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Integer userId) {

        return cartService.getCart(userId);

    }

    // Update quantity
    @PutMapping("/update")
    public String updateQuantity(
            @RequestParam Integer cartId,
            @RequestParam Integer quantity) {

        int result = cartService.updateQuantity(cartId, quantity);

        if (result > 0) {
            return "Quantity Updated";
        }

        return "Update Failed";
    }

    // Remove one item
    @DeleteMapping("/remove/{cartId}")
    public String removeItem(@PathVariable Integer cartId) {

        int result = cartService.removeItem(cartId);

        if (result > 0) {
            return "Item Removed";
        }

        return "Remove Failed";
    }

    // Clear entire cart
    @DeleteMapping("/clear/{userId}")
    public String clearCart(@PathVariable Integer userId) {

        int result = cartService.clearCart(userId);

        if (result > 0) {
            return "Cart Cleared";
        }

        return "Cart Already Empty";
    }
}