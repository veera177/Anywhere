package com.app.start_app.food;

public class Restaurant {

    private int id;
    private String name;
    private String district;
    private double rating;
    private String location;
    private String deliveryType;
    private Double latitude;
    private Double longitude;
    private String taluk;
    private String pincode;
    private Boolean isVerified;
    private Boolean isActive;
    private int ratingCount;

    public Restaurant() {
    }

    public Restaurant(
            int id,
            String name,
            String district,
            double rating,
            String location,
            String deliveryType,
            Double latitude,
            Double longitude,
            String taluk,
            String pincode,
            Boolean isVerified,
            Boolean isActive
    ) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.rating = rating;
        this.location = location;
        this.deliveryType = deliveryType;
        this.latitude = latitude;
        this.longitude = longitude;
        this.taluk = taluk;
        this.pincode = pincode;
        this.isVerified = isVerified;
        this.isActive = isActive;
    }
    
    // For backwards compatibility
    public Restaurant(int id, String name, String district, double rating, String location, String deliveryType) {
        this(id, name, district, rating, location, deliveryType, null, null, null, null, true, true);
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDeliveryType() { return deliveryType; }
    public void setDeliveryType(String deliveryType) { this.deliveryType = deliveryType; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }
}
