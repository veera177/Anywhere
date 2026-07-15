package com.app.start_app.payment;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody PaymentRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createRazorpayOrder(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestBody RazorpayVerifyRequest request) {
        try {
            return ResponseEntity.ok(paymentService.verifyRazorpayPayment(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/cod")
    public ResponseEntity<?> completeCod(@RequestBody PaymentRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.completeCod(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public List<Payment> getPaymentHistory(@PathVariable Integer userId) {
        return paymentService.getPaymentHistory(userId);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPayment(@PathVariable Integer paymentId) {
        Payment payment = paymentService.getPayment(paymentId);
        return payment == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(payment);
    }
}
