package com.app.start_app.user;

public class Address {

    private Integer id;
    private Integer userId;
    private String title;
    private String address;
    private String city;
    private String district;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String addressType;
    private Boolean isDefault;

    public Address() {
    }

    public Address(Integer id, Integer userId, String title, String address, String city, String district, String pincode) {
        this(id, userId, title, address, city, district, pincode, null, null, "HOME", false);
    }

    public Address(Integer id, Integer userId, String title, String address, String city, String district,
                   String pincode, Double latitude, Double longitude, String addressType, Boolean isDefault) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.address = address;
        this.city = city;
        this.district = district;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.addressType = addressType;
        this.isDefault = isDefault;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
