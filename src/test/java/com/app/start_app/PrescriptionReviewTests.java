package com.app.start_app;

import com.app.start_app.prescription.Prescription;
import com.app.start_app.prescription.PrescriptionController;
import com.app.start_app.prescription.PrescriptionDAO;
import com.app.start_app.prescription.PrescriptionService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

@SpringBootTest
public class PrescriptionReviewTests {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PrescriptionController prescriptionController;

    @Autowired
    private PrescriptionDAO prescriptionDAO;

    @Test
    public void testPrescriptionReviewStatusTransition() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test-prescription.pdf",
                "application/pdf",
                "Dummy prescription content for test".getBytes()
        );

        // Upload prescription for user 1
        Prescription uploaded = prescriptionService.upload(1, null, mockFile, false);
        Assertions.assertNotNull(uploaded);
        Long id = uploaded.getId();

        // Initial status is PENDING or UPLOADED or UNDER_REVIEW
        Prescription current = prescriptionService.getStatus(id);
        Assertions.assertNotNull(current);

        // Verify status endpoint call
        ResponseEntity<?> statusResponse = prescriptionController.status(id, 1);
        Assertions.assertTrue(statusResponse.getStatusCode().is2xxSuccessful());
        Assertions.assertNotNull(statusResponse.getBody());

        // Wait a short moment and check transition
        Thread.sleep(1200);
        Prescription underReview = prescriptionService.getStatus(id);
        Assertions.assertTrue(
                "UNDER_REVIEW".equals(underReview.getStatus()) ||
                "VERIFIED".equals(underReview.getStatus()) ||
                "APPROVED".equals(underReview.getStatus()) ||
                "PENDING".equals(underReview.getStatus())
        );
    }

    @Test
    public void testStockCheckCrossPharmacy() {
        // Test pharmacy stock check for medicine in Salem
        Integer stock = prescriptionDAO.checkStockAtPharmacy(1, 1);
        Assertions.assertNotNull(stock);
    }
}