package com.app.start_app.food;

public class FoodProduct {

    private int id;
    private String district;
    private String category;
    private String name;
    private String description;
    private double price;
    private int stock;
    private double rating;
    private String offerTag;
    private String foodType;
    private String imageUrl;
    private boolean available;
    private String restaurantName;
    private Integer restaurantId;

    public FoodProduct() {
    }

    public FoodProduct(
            int id,
            String district,
            String category,
            String name,
            String description,
            double price,
            int stock,
            double rating,
            String offerTag,
            String foodType,
            String imageUrl,
            boolean available,
            String restaurantName
    ) {
        this(id, district, category, name, description, price, stock, rating, offerTag, foodType, imageUrl, available, restaurantName, null);
    }

    public FoodProduct(
            int id,
            String district,
            String category,
            String name,
            String description,
            double price,
            int stock,
            double rating,
            String offerTag,
            String foodType,
            String imageUrl,
            boolean available,
            String restaurantName,
            Integer restaurantId
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
        this.foodType = foodType;
        this.imageUrl = imageUrl;
        this.available = available;
        this.restaurantName = restaurantName;
        this.restaurantId = restaurantId;
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

    public String getFoodType() {
        return foodType;
    }

    public void setFoodType(String foodType) {
        this.foodType = foodType;
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

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Integer getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Integer restaurantId) {
        this.restaurantId = restaurantId;
    }
}
