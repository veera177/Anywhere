package com.app.start_app.order;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.app.start_app.security.CurrentUser;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, @AuthenticationPrincipal Integer userId) {
        try {
            request.setUserId(CurrentUser.require(userId));
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);
        return orderService.getUserOrders(userId);
    }

    @GetMapping("/track/{orderId}")
    public ResponseEntity<?> getTracking(@PathVariable Integer orderId, @AuthenticationPrincipal Integer userId) {
        try {
            requireOwner(orderId, userId);
            return ResponseEntity.ok(orderService.getTracking(orderId));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Integer orderId, @AuthenticationPrincipal Integer userId) {
        Order order = orderService.getOrder(orderId);
        if (order != null) CurrentUser.owns(userId, order.getUserId());
        return order == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(order);
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateTrackingStatus(@RequestBody UpdateTrackingStatusRequest request, @AuthenticationPrincipal Integer userId) {
        try {
            requireOwner(request.getOrderId(), userId);
            requireCancellation(request.getStatus());
            String status = orderService.updateTrackingStatus(request.getOrderId(), request.getStatus());
            return ResponseEntity.ok(Map.of("trackingStatus", status));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> body, @AuthenticationPrincipal Integer userId
    ) {
        try {
            requireOwner(orderId, userId);
            requireCancellation(body.get("status"));
            orderService.updateStatus(orderId, body.get("status"));
            return ResponseEntity.ok(Map.of("message", "Order status updated"));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/{orderId}/reorder")
    public ResponseEntity<?> reorder(
            @PathVariable Integer orderId,
            @RequestBody Map<String, Object> body, @AuthenticationPrincipal Integer userId
    ) {
        try {
            ReorderResult result = orderService.reorder(orderId, CurrentUser.require(userId));
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @GetMapping(value = "/{orderId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Integer orderId, @AuthenticationPrincipal Integer userId) {
        requireOwner(orderId, userId);
        return orderService.subscribe(orderId);
    }

    private void requireOwner(Integer orderId, Integer userId) {
        Order order = orderService.getOrder(orderId);
        if (order == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        CurrentUser.owns(userId, order.getUserId());
    }

    private void requireCancellation(String status) {
        if (!"CANCELLED".equalsIgnoreCase(status))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customers may only cancel their own order");
    }
}
