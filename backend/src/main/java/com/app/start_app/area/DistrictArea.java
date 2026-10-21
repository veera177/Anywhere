package com.app.start_app.area;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class DistrictArea {

    private Integer id;
    private Integer districtId;
    private String areaName;
    private String subtext;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String pincode;
    private Timestamp createdAt;

    public DistrictArea() {
    }

    public DistrictArea(Integer id, Integer districtId, String areaName, String subtext, BigDecimal latitude, BigDecimal longitude, String pincode, Timestamp createdAt) {
        this.id = id;
        this.districtId = districtId;
        this.areaName = areaName;
        this.subtext = subtext;
        this.latitude = latitude;
        this.longitude = longitude;
        this.pincode = pincode;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDistrictId() {
        return districtId;
    }

    public void setDistrictId(Integer districtId) {
        this.districtId = districtId;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public String getSubtext() {
        return subtext;
    }

    public void setSubtext(String subtext) {
        this.subtext = subtext;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}