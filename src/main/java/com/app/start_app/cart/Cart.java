package com.app.start_app.cart;

import java.sql.Timestamp;

public class Cart {

    private Integer id;
    private Integer userId;
    private String serviceType;
    private Integer productId;
    private Integer quantity;
    private String productName;
    private String providerName;
    private Double price;
    private Double rating;
    private String imageUrl;
    private Timestamp addedAt;

    public Cart() {
    }

    public Cart(Integer id,
                Integer userId,
                String serviceType,
                Integer productId,
                Integer quantity,
                Timestamp addedAt) {

        this.id = id;
        this.userId = userId;
        this.serviceType = serviceType;
        this.productId = productId;
        this.quantity = quantity;
        this.addedAt = addedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Timestamp getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Timestamp addedAt) {
        this.addedAt = addedAt;
    }
}
