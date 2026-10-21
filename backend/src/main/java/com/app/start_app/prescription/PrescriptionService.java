package com.app.start_app.prescription;

import com.app.start_app.order.OrderItem;
import com.app.start_app.platform.PlatformSettingDAO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class PrescriptionService {
    private static final String VERIFIED = "VERIFIED";
    private final PrescriptionDAO prescriptionDAO;
    private final PlatformSettingDAO settings;
    private final Path uploadDirectory;
    private final JdbcTemplate jdbcTemplate;

    public PrescriptionService(PrescriptionDAO prescriptionDAO, PlatformSettingDAO settings,
                                @Value("${prescription.upload-dir:uploads/prescriptions}") String uploadDir,
                                JdbcTemplate jdbcTemplate) {
        this.prescriptionDAO = prescriptionDAO;
        this.settings = settings;
        this.uploadDirectory = Path.of(uploadDir).toAbsolutePath().normalize();
        this.jdbcTemplate = jdbcTemplate;
    }

    // New upload method for prescription-required medicines (before adding to cart)
    public Prescription uploadForMedicine(Integer userId, Integer medicineId, Integer primaryPharmacyId, MultipartFile file) {
        validateFile(file);
        String fileUrl = storeFile(file);
        Long id = prescriptionDAO.insertForMedicine(userId, medicineId, primaryPharmacyId, fileUrl);
        Prescription prescription = prescriptionDAO.findById(id);
        scheduleReviewWithStockCheck(id, userId, medicineId, primaryPharmacyId);
        return prescription;
    }

    public Prescription upload(Integer userId, Integer orderDraftId, MultipartFile file, boolean demoReject) {
        validateFile(file);
        Prescription prescription = createPrescription(userId, file);
        scheduleReview(prescription.getId(), userId, demoReject || file.getSize() == 0);
        return prescriptionDAO.findById(prescription.getId());
    }

    public Prescription resubmit(Long id, Integer userId, MultipartFile file, boolean demoReject) {
        validateFile(file);
        Prescription existing = prescriptionDAO.findById(id);
        if (existing == null || !userId.equals(existing.getUserId())) {
            throw new IllegalArgumentException("Prescription not found");
        }
        String fileUrl = storeFile(file);
        if (prescriptionDAO.resubmit(id, userId, fileUrl) == 0) {
            throw new IllegalStateException("Only rejected prescriptions can be resubmitted");
        }
        // For resubmit, if it was for a medicine, run stock check again
        if (existing.getMedicineId() != null && existing.getAssignedPharmacyId() != null) {
            scheduleReviewWithStockCheck(id, userId, existing.getMedicineId(), existing.getAssignedPharmacyId());
        } else {
            scheduleReview(id, userId, demoReject || file.getSize() == 0);
        }
        return prescriptionDAO.findById(id);
    }

    public Prescription getStatus(Long id) {
        Prescription prescription = prescriptionDAO.findById(id);
        if (prescription == null) throw new IllegalArgumentException("Prescription not found");
        return prescription;
    }

    public Prescription getStatusForUser(Long id, Integer userId) {
        Prescription prescription = getStatus(id);
        if (!userId.equals(prescription.getUserId())) throw new IllegalArgumentException("Prescription not found");
        return prescription;
    }

    public Map<String, Object> getOrderStatus(Integer orderId) {
        return prescriptionDAO.getOrderStatus(orderId);
    }

    public Map<String, Object> checkCart(List<Integer> medicineIds) {
        List<Map<String, Object>> flaggedItems = prescriptionDAO.checkMedicineRequirements(medicineIds);
        return Map.of("requiresPrescription", !flaggedItems.isEmpty(), "flaggedItems", flaggedItems);
    }

    public void validateMedicineOrder(Integer userId, List<OrderItem> items) {
        List<Integer> medicineIds = items.stream()
                .filter(item -> "MEDICINE".equalsIgnoreCase(item.getServiceType()))
                .map(OrderItem::getProductId)
                .toList();
        if (!medicineIds.isEmpty() && !prescriptionDAO.checkMedicineRequirements(medicineIds).isEmpty()
                && !prescriptionDAO.hasValidVerifiedPrescription(userId)) {
            throw new IllegalArgumentException("A verified prescription is required before ordering these medicines");
        }
    }

    public void linkVerifiedPrescription(Integer userId, Integer orderId, List<OrderItem> items) {
        if (items.stream().anyMatch(item -> "MEDICINE".equalsIgnoreCase(item.getServiceType()))) {
            prescriptionDAO.linkLatestVerifiedPrescription(userId, orderId);
        }
    }

    private Prescription createPrescription(Integer userId, MultipartFile file) {
        String fileUrl = storeFile(file);
        Long id = prescriptionDAO.insert(userId, fileUrl);
        return prescriptionDAO.findById(id);
    }

    // Enhanced review with stock check + cross-shop fallback
    private void scheduleReviewWithStockCheck(Long id, Integer userId, Integer medicineId, Integer primaryPharmacyId) {
        long delay = Math.max(1, settings.getDecimal("prescription.review_delay_seconds").longValue());
        CompletableFuture.delayedExecutor(100, TimeUnit.MILLISECONDS).execute(() -> prescriptionDAO.moveToUnderReview(id));
        
        CompletableFuture.delayedExecutor(delay, TimeUnit.SECONDS).execute(() -> {
            try {
                Prescription current = prescriptionDAO.findById(id);
                if (current == null) return;
                
                // Step 1: Check stock at primary pharmacy
                Integer primaryStock = prescriptionDAO.checkStockAtPharmacy(primaryPharmacyId, medicineId);
                String district = getPharmacyDistrict(primaryPharmacyId);
                
                if (primaryStock != null && primaryStock > 0) {
                    // Primary pharmacy has stock - APPROVED at primary
                    long validityDays = Math.max(1, settings.getDecimal("prescription.repeat_order_validity_days").longValue());
                    prescriptionDAO.resolveWithPharmacy(id, false, null, primaryPharmacyId, LocalDate.now().plusDays(validityDays));
                    return;
                }
                
                // Step 2: Primary out of stock - check other pharmacies in same district
                List<Integer> otherPharmacyIds = prescriptionDAO.getOtherPharmacyIdsInDistrict(primaryPharmacyId, district);
                for (Integer otherPharmacyId : otherPharmacyIds) {
                    Integer otherStock = prescriptionDAO.checkStockAtPharmacy(otherPharmacyId, medicineId);
                    if (otherStock != null && otherStock > 0) {
                        // Found at another pharmacy - APPROVED with reassignment
                        long validityDays = Math.max(1, settings.getDecimal("prescription.repeat_order_validity_days").longValue());
                        prescriptionDAO.resolveWithPharmacy(id, false, null, otherPharmacyId, LocalDate.now().plusDays(validityDays));
                        return;
                    }
                }
                
                // Step 3: No pharmacy in district has stock - REJECTED
                String medicineName = prescriptionDAO.getMedicineName(medicineId);
                String reason = "Currently unavailable at nearby pharmacies: " + medicineName;
                prescriptionDAO.resolveWithPharmacy(id, true, reason, null, null);
            } catch (Exception e) {
                System.err.println("Error in prescription review thread: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    // Legacy review method for order-time prescriptions
    private void scheduleReview(Long id, Integer userId, boolean demoReject) {
        long delay = Math.max(1, settings.getDecimal("prescription.review_delay_seconds").longValue());
        CompletableFuture.delayedExecutor(100, TimeUnit.MILLISECONDS).execute(() -> prescriptionDAO.moveToUnderReview(id));
        CompletableFuture.delayedExecutor(delay, TimeUnit.SECONDS).execute(() -> {
            try {
                Prescription current = prescriptionDAO.findById(id);
                if (current == null) return;
                if (demoReject) {
                    prescriptionDAO.resolve(id, true, "Image too blurry to read", null);
                } else {
                    long validityDays = Math.max(1, settings.getDecimal("prescription.repeat_order_validity_days").longValue());
                    prescriptionDAO.resolve(id, false, null, LocalDate.now().plusDays(validityDays));
                }
            } catch (Exception e) {
                System.err.println("Error in legacy prescription review thread: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    private String getPharmacyDistrict(Integer pharmacyId) {
        String sql = "SELECT district FROM pharmacies WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, pharmacyId);
        } catch (Exception e) {
            return "salem"; // fallback
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Please upload a prescription file");
        long maxBytes = Math.max(1, settings.getDecimal("prescription.max_file_size_mb").longValue()) * 1024L * 1024L;
        if (file.getSize() > maxBytes) throw new IllegalArgumentException("Prescription file must be within the configured size limit");
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/") && !"application/pdf".equals(contentType)) {
            throw new IllegalArgumentException("Only prescription images and PDF files are accepted");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            Files.createDirectories(uploadDirectory);
            String original = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
            String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".bin";
            String filename = UUID.randomUUID() + extension.replaceAll("[^A-Za-z0-9.]", "");
            Path target = uploadDirectory.resolve(filename).normalize();
            if (!target.getParent().equals(uploadDirectory)) throw new IllegalArgumentException("Invalid upload filename");
            Files.write(target, file.getBytes());
            return "prescriptions/" + filename;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store prescription file", exception);
        }
    }
}
