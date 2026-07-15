package com.app.start_app.user;

public class Address {

    private Integer id;
    private Integer userId;
    private String title;
    private String address;
    private String city;
    private String district;
    private String pincode;

    public Address() {
    }

    public Address(Integer id, Integer userId, String title, String address, String city, String district, String pincode) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.address = address;
        this.city = city;
        this.district = district;
        this.pincode = pincode;
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
}
