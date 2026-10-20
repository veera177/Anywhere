package com.app.start_app.prescription;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.app.start_app.security.CurrentUser;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    // Debug endpoint to test multipart
    @PostMapping("/prescriptions/test-multipart")
    public ResponseEntity<?> testMultipart(@RequestParam(required = false) Integer userId,
                                           @RequestPart(required = false) MultipartFile file) {
        String info = "userId=" + userId + ", file=" + (file != null ? file.getOriginalFilename() + " (" + file.getSize() + " bytes)" : "null");
        return ResponseEntity.ok(Map.of("received", info));
    }

    // New endpoint: upload prescription for a specific medicine (before cart addition)
    @PostMapping("/prescriptions/upload-for-medicine")
    public ResponseEntity<?> uploadForMedicine(@RequestParam Integer userId,
                                               @RequestParam Integer medicineId,
                                               @RequestParam Integer pharmacyId,
                                               @RequestPart MultipartFile file, @AuthenticationPrincipal Integer authenticatedUserId) {
        Integer jwtUserId = CurrentUser.require(authenticatedUserId);
        return execute(() -> prescriptionService.uploadForMedicine(jwtUserId, medicineId, pharmacyId, file), HttpStatus.CREATED);
    }

    @PostMapping("/prescriptions/upload")
    public ResponseEntity<?> upload(@RequestParam Integer userId,
                                    @RequestParam(required = false) Integer orderDraftId,
                                    @RequestPart MultipartFile file,
                                    @RequestParam(defaultValue = "false") boolean demoReject, @AuthenticationPrincipal Integer authenticatedUserId) {
        Integer jwtUserId = CurrentUser.require(authenticatedUserId);
        return execute(() -> prescriptionService.upload(jwtUserId, orderDraftId, file, demoReject), HttpStatus.CREATED);
    }

    @GetMapping("/prescriptions/{id}/status")
    public ResponseEntity<?> status(@PathVariable Long id, @AuthenticationPrincipal Integer userId) {
        return execute(() -> prescriptionService.getStatusForUser(id, CurrentUser.require(userId)), HttpStatus.OK);
    }

    @PostMapping("/prescriptions/{id}/resubmit")
    public ResponseEntity<?> resubmit(@PathVariable Long id, @RequestParam Integer userId,
                                      @RequestPart MultipartFile file,
                                      @RequestParam(defaultValue = "false") boolean demoReject, @AuthenticationPrincipal Integer authenticatedUserId) {
        return execute(() -> prescriptionService.resubmit(id, CurrentUser.require(authenticatedUserId), file, demoReject), HttpStatus.OK);
    }

    @GetMapping("/orders/{orderId}/prescription-status")
    public ResponseEntity<?> orderStatus(@PathVariable Integer orderId) {
        return ResponseEntity.ok(prescriptionService.getOrderStatus(orderId));
    }

    @PostMapping("/medicines/cart-prescription-check")
    public ResponseEntity<?> cartCheck(@RequestBody List<Integer> medicineIds) {
        return ResponseEntity.ok(prescriptionService.checkCart(medicineIds));
    }

    private ResponseEntity<?> execute(java.util.function.Supplier<Object> action, HttpStatus success) {
        try {
            return ResponseEntity.status(success).body(action.get());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", exception.getMessage()));
        }
    }
}
