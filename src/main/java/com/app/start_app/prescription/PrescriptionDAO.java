package com.app.start_app.prescription;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Repository
public class PrescriptionDAO {
    private final JdbcTemplate jdbcTemplate;

    public PrescriptionDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Legacy insert for order-time prescriptions (backward compatibility)
    public Long insert(Integer userId, String fileUrl) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    "INSERT INTO prescriptions (user_id, file_url, status) VALUES (?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setInt(1, userId);
            statement.setString(2, fileUrl);
            return statement;
        }, keyHolder);
        if (keyHolder.getKey() == null) {
            throw new IllegalStateException("Prescription could not be created");
        }
        return keyHolder.getKey().longValue();
    }

    // Insert prescription for a specific medicine and primary pharmacy (before cart addition)
    public Long insertForMedicine(Integer userId, Integer medicineId, Integer primaryPharmacyId, String fileUrl) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    "INSERT INTO prescriptions (user_id, medicine_id, assigned_pharmacy_id, file_url, status) VALUES (?, ?, ?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setInt(1, userId);
            statement.setInt(2, medicineId);
            statement.setInt(3, primaryPharmacyId);
            statement.setString(4, fileUrl);
            return statement;
        }, keyHolder);
        if (keyHolder.getKey() == null) {
            throw new IllegalStateException("Prescription could not be created");
        }
        return keyHolder.getKey().longValue();
    }

    public Prescription findById(Long id) {
        List<Prescription> results = jdbcTemplate.query(
                "SELECT * FROM prescriptions WHERE id = ?",
                (rs, row) -> map(rs), id
        );
        return results.isEmpty() ? null : results.get(0);
    }

    public int moveToUnderReview(Long id) {
        return jdbcTemplate.update(
                "UPDATE prescriptions SET status='UNDER_REVIEW' WHERE id=? AND status IN ('PENDING', 'UPLOADED')", id);
    }

    // Legacy resolve for order-time prescriptions (backward compatibility)
    public int resolve(Long id, boolean rejected, String reason, LocalDate validUntil) {
        return jdbcTemplate.update(
                "UPDATE prescriptions SET status=?, rejection_reason=?, valid_until=?, reviewed_at=CURRENT_TIMESTAMP "
                        + "WHERE id=? AND status IN ('UNDER_REVIEW', 'PENDING', 'UPLOADED')",
                rejected ? "REJECTED" : "VERIFIED", rejected ? reason : null,
                rejected ? null : Date.valueOf(validUntil), id
        );
    }

    // Resolve with stock check result: APPROVED (with assigned_pharmacy_id) or REJECTED
    public int resolveWithPharmacy(Long id, boolean rejected, String reason, Integer assignedPharmacyId, LocalDate validUntil) {
        return jdbcTemplate.update(
                "UPDATE prescriptions SET status=?, rejection_reason=?, assigned_pharmacy_id=?, valid_until=?, reviewed_at=CURRENT_TIMESTAMP "
                        + "WHERE id=? AND status IN ('UNDER_REVIEW', 'PENDING', 'UPLOADED')",
                rejected ? "REJECTED" : "APPROVED", rejected ? reason : null,
                assignedPharmacyId,
                rejected ? null : Date.valueOf(validUntil), id
        );
    }

    public int resubmit(Long id, Integer userId, String fileUrl) {
        return jdbcTemplate.update(
                "UPDATE prescriptions SET file_url=?, status='PENDING', rejection_reason=NULL, "
                        + "valid_until=NULL, reviewed_at=NULL, order_id=NULL, assigned_pharmacy_id=NULL "
                        + "WHERE id=? AND user_id=? AND status='REJECTED'",
                fileUrl, id, userId
        );
    }

    public Map<String, Object> getOrderStatus(Integer orderId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT status, rejection_reason AS rejectionReason, id AS prescriptionId "
                        + "FROM prescriptions WHERE order_id=? ORDER BY uploaded_at DESC LIMIT 1", orderId);
        if (rows.isEmpty()) {
            return Map.of("status", "NOT_REQUIRED", "rejectionReason", "");
        }
        return rows.get(0);
    }

    public boolean hasValidVerifiedPrescription(Integer userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM prescriptions WHERE user_id=? AND status IN ('VERIFIED','APPROVED') "
                        + "AND valid_until >= CURRENT_DATE AND (order_id IS NULL OR order_id IN "
                        + "(SELECT id FROM orders WHERE user_id=?))",
                Integer.class, userId, userId);
        return count != null && count > 0;
    }

    public void linkLatestVerifiedPrescription(Integer userId, Integer orderId) {
        List<Long> ids = jdbcTemplate.query(
                "SELECT id FROM prescriptions WHERE user_id=? AND status IN ('VERIFIED','APPROVED') "
                        + "AND valid_until >= CURRENT_DATE AND order_id IS NULL ORDER BY uploaded_at DESC LIMIT 1",
                (rs, row) -> rs.getLong("id"), userId);
        if (!ids.isEmpty()) {
            jdbcTemplate.update("UPDATE prescriptions SET order_id=? WHERE id=? AND order_id IS NULL", orderId, ids.get(0));
        }
    }

    public List<Map<String, Object>> checkMedicineRequirements(List<Integer> medicineIds) {
        if (medicineIds == null || medicineIds.isEmpty()) return List.of();
        StringJoiner placeholders = new StringJoiner(",");
        medicineIds.forEach(id -> placeholders.add("?"));
        String sql = "SELECT id, name, schedule_type AS scheduleType, "
                + "(schedule_type <> 'OTC') AS requiresPrescription "
                + "FROM medicine_products WHERE id IN (" + placeholders + ") AND schedule_type <> 'OTC'";
        return jdbcTemplate.queryForList(sql, medicineIds.toArray());
    }

    // Check stock at a specific pharmacy for a medicine (supporting direct ID and cross-pharmacy generic match)
    public Integer checkStockAtPharmacy(Integer pharmacyId, Integer medicineId) {
        // Direct match
        String sql = "SELECT stock FROM medicine_products WHERE id = ? AND pharmacy_id = ?";
        try {
            List<Integer> list = jdbcTemplate.queryForList(sql, Integer.class, medicineId, pharmacyId);
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception ignored) {}

        // Cross-pharmacy fallback match: match by category or base name
        String fallbackSql = """
                SELECT m2.stock
                FROM medicine_products m1
                JOIN medicine_products m2 ON m2.pharmacy_id = ?
                  AND (
                    SUBSTRING_INDEX(m2.name, ' (', 1) = SUBSTRING_INDEX(m1.name, ' (', 1)
                    OR (m2.category = m1.category AND m2.dosage = m1.dosage)
                  )
                WHERE m1.id = ?
                LIMIT 1
                """;
        try {
            List<Integer> list = jdbcTemplate.queryForList(fallbackSql, Integer.class, pharmacyId, medicineId);
            return list.isEmpty() ? 0 : list.get(0);
        } catch (Exception e) {
            return 0;
        }
    }

    // Get other pharmacies in the same district (excluding the primary one)
    public List<Integer> getOtherPharmacyIdsInDistrict(Integer primaryPharmacyId, String district) {
        String sql = "SELECT id FROM pharmacies WHERE LOWER(district) = LOWER(?) AND id != ?";
        return jdbcTemplate.queryForList(sql, Integer.class, district, primaryPharmacyId);
    }

    // Get pharmacy name by ID
    public String getPharmacyName(Integer pharmacyId) {
        String sql = "SELECT name FROM pharmacies WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, pharmacyId);
        } catch (Exception e) {
            return "Unknown Pharmacy";
        }
    }

    // Get medicine name by ID
    public String getMedicineName(Integer medicineId) {
        String sql = "SELECT name FROM medicine_products WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, medicineId);
        } catch (Exception e) {
            return "Unknown Medicine";
        }
    }

    private Prescription map(java.sql.ResultSet rs) throws java.sql.SQLException {
        Prescription prescription = new Prescription();
        prescription.setId(rs.getLong("id"));
        prescription.setOrderId((Integer) rs.getObject("order_id"));
        prescription.setCartItemId((Integer) rs.getObject("cart_item_id"));
        prescription.setUserId(rs.getInt("user_id"));
        prescription.setMedicineId((Integer) rs.getObject("medicine_id"));
        prescription.setAssignedPharmacyId((Integer) rs.getObject("assigned_pharmacy_id"));
        prescription.setFileUrl(rs.getString("file_url"));
        prescription.setStatus(rs.getString("status"));
        prescription.setRejectionReason(rs.getString("rejection_reason"));
        Date validUntil = rs.getDate("valid_until");
        if (validUntil != null) prescription.setValidUntil(validUntil.toLocalDate());
        Timestamp uploadedAt = rs.getTimestamp("uploaded_at");
        if (uploadedAt != null) prescription.setUploadedAt(uploadedAt.toLocalDateTime());
        Timestamp reviewedAt = rs.getTimestamp("reviewed_at");
        if (reviewedAt != null) prescription.setReviewedAt(reviewedAt.toLocalDateTime());
        return prescription;
    }
}