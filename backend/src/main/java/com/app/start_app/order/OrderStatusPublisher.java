package com.app.start_app.order;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OrderStatusPublisher {
    private final ConcurrentHashMap<Integer, Set<SseEmitter>> clients = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeats = Executors.newSingleThreadScheduledExecutor();
    public SseEmitter subscribe(Integer orderId) {
        SseEmitter emitter = new SseEmitter(0L);
        clients.computeIfAbsent(orderId, ignored -> ConcurrentHashMap.newKeySet()).add(emitter);
        emitter.onCompletion(() -> remove(orderId, emitter));
        emitter.onTimeout(() -> remove(orderId, emitter));
        heartbeats.scheduleAtFixedRate(() -> send(orderId, emitter, "heartbeat", "keep-alive"), 25, 25, TimeUnit.SECONDS);
        return emitter;
    }
    public void publish(Integer orderId, OrderTrackingResponse tracking) {
        clients.getOrDefault(orderId, Set.of()).forEach(emitter -> send(orderId, emitter, "status", tracking));
    }
    private void send(Integer orderId, SseEmitter emitter, String event, Object payload) {
        try { emitter.send(SseEmitter.event().name(event).data(payload)); }
        catch (IOException | IllegalStateException ex) { remove(orderId, emitter); }
    }
    private void remove(Integer orderId, SseEmitter emitter) {
        Set<SseEmitter> set = clients.get(orderId);
        if (set != null) { set.remove(emitter); if (set.isEmpty()) clients.remove(orderId, set); }
    }
}
