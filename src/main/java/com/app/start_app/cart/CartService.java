package com.app.start_app.cart;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartDAO cartDAO;

    public CartService(CartDAO cartDAO) {
        this.cartDAO = cartDAO;
    }

    public String addToCart(Cart cart) {
        return cartDAO.addToCart(cart);
    }

    public List<CartItem> getCart(Integer userId) {
        return cartDAO.getCartByUser(userId);
    }

    public int updateQuantity(Integer cartId, Integer quantity) {
        return cartDAO.updateQuantity(cartId, quantity);
    }

    public int removeItem(Integer cartId) {
        return cartDAO.removeItem(cartId);
    }

    public int clearCart(Integer userId) {
        return cartDAO.clearCart(userId);
    }

    public int clearCartService(Integer userId, String serviceType) {
        return cartDAO.clearCartService(userId, serviceType);
    }
}
