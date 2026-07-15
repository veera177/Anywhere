package com.app.start_app.payment;

import com.app.start_app.order.CreateOrderRequest;
import com.app.start_app.order.Order;
import com.app.start_app.order.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PaymentService {

    private static final String CURRENCY = "INR";

    private final PaymentDAO paymentDAO;
    private final OrderService orderService;
    private final String razorpayKeyId;
    private final String razorpaySecret;

    public PaymentService(
            PaymentDAO paymentDAO,
            OrderService orderService,
            @Value("${razorpay.key.id:}") String razorpayKeyId,
            @Value("${razorpay.key.secret:}") String razorpaySecret
    ) {
        this.paymentDAO = paymentDAO;
        this.orderService = orderService;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpaySecret = razorpaySecret;
    }

    @Transactional
    public PaymentResponse completeCod(PaymentRequest request) {
        CreateOrderRequest orderRequest = validatedOrderRequest(request);
        orderRequest.setPaymentMethod("CASH_ON_DELIVERY");

        Order order = orderService.createOrder(orderRequest);
        Payment payment = createPayment(order, "CASH_ON_DELIVERY", "COD-" + order.getId(), "PENDING");
        paymentDAO.updateOrderStatus(order.getId(), "PENDING_CONFIRMATION");

        return response(payment, order, null, null);
    }

    @Transactional
    public PaymentResponse createRazorpayOrder(PaymentRequest request) {
        CreateOrderRequest orderRequest = validatedOrderRequest(request);
        orderRequest.setPaymentMethod("RAZORPAY");

        Order order = orderService.createOrder(orderRequest);
        String razorpayOrderId = createGatewayOrder(order);
        Payment payment = createPayment(order, "RAZORPAY", razorpayOrderId, "PENDING");

        PaymentResponse response = response(payment, order, razorpayOrderId, amountInPaise(order.getTotalAmount()));
        response.setRazorpayKeyId(razorpayKeyId);
        if (isTestMode()) {
            response.setTestSignature(createSignature(razorpayOrderId, "pay_test_" + payment.getId()));
        }
        return response;
    }

    @Transactional
    public PaymentResponse verifyRazorpayPayment(RazorpayVerifyRequest request) {
        if (request.getPaymentId() == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Payment and order are required");
        }

        Payment payment = paymentDAO.findById(request.getPaymentId());
        if (payment == null || !payment.getOrderId().equals(request.getOrderId())) {
            throw new IllegalArgumentException("Payment record not found");
        }

        if (!verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            paymentDAO.updateStatus(payment.getId(), request.getRazorpayPaymentId(), "FAILED");
            paymentDAO.updateOrderStatus(payment.getOrderId(), "PAYMENT_FAILED");
            throw new IllegalArgumentException("Payment verification failed");
        }

        paymentDAO.updateStatus(payment.getId(), request.getRazorpayPaymentId(), "SUCCESS");
        paymentDAO.updateOrderStatus(payment.getOrderId(), "CONFIRMED");

        Payment updatedPayment = paymentDAO.findById(payment.getId());
        Order order = orderService.getOrder(payment.getOrderId());
        return response(updatedPayment, order, request.getRazorpayOrderId(), amountInPaise(updatedPayment.getAmount()));
    }

    public List<Payment> getPaymentHistory(Integer userId) {
        return paymentDAO.findByUserId(userId);
    }

    public Payment getPayment(Integer paymentId) {
        return paymentDAO.findById(paymentId);
    }

    private String createGatewayOrder(Order order) {
        if (!hasRealRazorpayKeys()) {
            return "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);
        }

        try {
            String body = String.format(
                    "{\"amount\":%d,\"currency\":\"%s\",\"receipt\":\"anywhere_order_%d\",\"payment_capture\":1}",
                    amountInPaise(order.getTotalAmount()),
                    CURRENCY,
                    order.getId()
            );

            String auth = Base64.getEncoder()
                    .encodeToString((razorpayKeyId + ":" + razorpaySecret).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + auth)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Razorpay order creation failed: " + response.body());
            }

            return readJsonString(response.body(), "id");
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create Razorpay order", exception);
        }
    }

    private CreateOrderRequest validatedOrderRequest(PaymentRequest request) {
        if (request == null || request.getOrderRequest() == null) {
            throw new IllegalArgumentException("Order details are required");
        }
        return request.getOrderRequest();
    }

    private Payment createPayment(Order order, String method, String transactionId, String status) {
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setUserId(order.getUserId());
        payment.setPaymentMethod(method);
        payment.setTransactionId(transactionId);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentStatus(status);
        Integer paymentId = paymentDAO.insert(payment);
        return paymentDAO.findById(paymentId);
    }

    private PaymentResponse response(Payment payment, Order order, String razorpayOrderId, Integer amountInPaise) {
        PaymentResponse response = new PaymentResponse();
        response.setPayment(payment);
        response.setOrder(order);
        response.setAmount(order.getTotalAmount());
        response.setAmountInPaise(amountInPaise == null ? amountInPaise(order.getTotalAmount()) : amountInPaise);
        response.setCurrency(CURRENCY);
        response.setRazorpayOrderId(razorpayOrderId);
        return response;
    }

    private Integer amountInPaise(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        if (isBlank(orderId) || isBlank(paymentId) || isBlank(signature) || isBlank(razorpaySecret)) {
            return false;
        }
        String expectedSignature = createSignature(orderId, paymentId);
        return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String createSignature(String orderId, String paymentId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpaySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to verify payment signature", exception);
        }
    }

    private boolean isTestMode() {
        return !isBlank(razorpaySecret) && razorpaySecret.toLowerCase().contains("test");
    }

    private boolean hasRealRazorpayKeys() {
        return !isBlank(razorpayKeyId)
                && !isBlank(razorpaySecret)
                && razorpayKeyId.startsWith("rzp_")
                && !razorpayKeyId.contains("anywhere")
                && !razorpaySecret.contains("anywhere");
    }

    private String readJsonString(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        if (!matcher.find()) {
            throw new IllegalStateException("Razorpay response did not contain " + key);
        }
        return matcher.group(1);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
