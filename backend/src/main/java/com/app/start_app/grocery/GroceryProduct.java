package com.app.start_app.grocery;

public class GroceryProduct {

    private int id;
    private String district;
    private String category;
    private String name;
    private String description;
    private double price;
    private int stock;
    private double rating;
    private String offerTag;
    private String unitType;
    private String imageUrl;
    private boolean available;
    private String storeName;
    private Integer storeId;

    public GroceryProduct() {
    }

    public GroceryProduct(
            int id,
            String district,
            String category,
            String name,
            String description,
            double price,
            int stock,
            double rating,
            String offerTag,
            String unitType,
            String imageUrl,
            boolean available,
            String storeName,
            Integer storeId
    ) {
        this.id = id;
        this.district = district;
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.rating = rating;
        this.offerTag = offerTag;
        this.unitType = unitType;
        this.imageUrl = imageUrl;
        this.available = available;
        this.storeName = storeName;
        this.storeId = storeId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getOfferTag() {
        return offerTag;
    }

    public void setOfferTag(String offerTag) {
        this.offerTag = offerTag;
    }

    public String getUnitType() {
        return unitType;
    }

    public void setUnitType(String unitType) {
        this.unitType = unitType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public Integer getStoreId() {
        return storeId;
    }

    public void setStoreId(Integer storeId) {
        this.storeId = storeId;
    }
}
