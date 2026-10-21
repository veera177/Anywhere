package com.app.start_app.security;

/**
 * AuthResponse - Response body for successful login.
 * Contains both the JWT token and basic user info.
 * Frontend stores the token and uses it for subsequent requests.
 */
public class AuthResponse {
    private String token;
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String district;
    private String addressLine;
    private String landmark;
    private String town;
    private String areaType;

    public AuthResponse() {
    }

    public AuthResponse(String token, Integer id, String fullName, String email,
                        String phone, String role, String district, String addressLine,
                        String landmark, String town, String areaType) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.district = district;
        this.addressLine = addressLine;
        this.landmark = landmark;
        this.town = town;
        this.areaType = areaType;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getTown() {
        return town;
    }

    public void setTown(String town) {
        this.town = town;
    }

    public String getAreaType() {
        return areaType;
    }

    public void setAreaType(String areaType) {
        this.areaType = areaType;
    }
}
