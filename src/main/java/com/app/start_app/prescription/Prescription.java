package com.app.start_app.prescription;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Prescription {
    private Long id;
    private Integer orderId;
    private Integer cartItemId;
    private Integer userId;
    private Integer medicineId;
    private Integer assignedPharmacyId;
    private String fileUrl;
    private String status;
    private String rejectionReason;
    private LocalDate validUntil;
    private LocalDateTime uploadedAt;
    private LocalDateTime reviewedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public Integer getCartItemId() { return cartItemId; }
    public void setCartItemId(Integer cartItemId) { this.cartItemId = cartItemId; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Integer getMedicineId() { return medicineId; }
    public void setMedicineId(Integer medicineId) { this.medicineId = medicineId; }
    public Integer getAssignedPharmacyId() { return assignedPharmacyId; }
    public void setAssignedPharmacyId(Integer assignedPharmacyId) { this.assignedPharmacyId = assignedPharmacyId; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
