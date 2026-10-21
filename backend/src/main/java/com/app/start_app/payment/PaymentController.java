package com.app.start_app.payment;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.app.start_app.security.CurrentUser;
import org.springframework.web.server.ResponseStatusException;

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
    public ResponseEntity<?> createRazorpayOrder(@RequestBody PaymentRequest request, @AuthenticationPrincipal Integer userId) {
        try {
            requireOrderIdentity(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createRazorpayOrder(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestBody RazorpayVerifyRequest request, @AuthenticationPrincipal Integer userId) {
        try {
            requirePaymentOwner(request.getPaymentId(), userId);
            return ResponseEntity.ok(paymentService.verifyRazorpayPayment(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/cod")
    public ResponseEntity<?> completeCod(@RequestBody PaymentRequest request, @AuthenticationPrincipal Integer userId) {
        try {
            requireOrderIdentity(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.completeCod(request));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public List<Payment> getPaymentHistory(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);
        return paymentService.getPaymentHistory(userId);
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPayment(@PathVariable Integer paymentId, @AuthenticationPrincipal Integer userId) {
        Payment payment = paymentService.getPayment(paymentId);
        if (payment != null) CurrentUser.owns(userId, payment.getUserId());
        return payment == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(payment);
    }

    private void requireOrderIdentity(PaymentRequest request, Integer userId) {
        if (request == null || request.getOrderRequest() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order details are required");
        request.getOrderRequest().setUserId(CurrentUser.require(userId));
    }
    private void requirePaymentOwner(Integer paymentId, Integer userId) {
        Payment payment = paymentService.getPayment(paymentId);
        if (payment == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
        CurrentUser.owns(userId, payment.getUserId());
    }
}
