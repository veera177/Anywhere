package com.app.start_app.grocery;

public class GroceryStore {

    private int id;
    private String name;
    private String district;
    private double rating;
    private String location;
    private String deliveryType;

    public GroceryStore() {
    }

    public GroceryStore(
            int id,
            String name,
            String district,
            double rating,
            String location,
            String deliveryType
    ) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.rating = rating;
        this.location = location;
        this.deliveryType = deliveryType;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }
}
