package com.puspo.uptime.modules.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.monitor.repository.MonitorRepository;
import com.puspo.uptime.modules.notification.entity.OutboxEvent;
import com.puspo.uptime.modules.notification.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxProcessor {

    private final OutboxEventRepository outboxEventRepository;
    private final MonitorRepository monitorRepository;
    private final EmailNotificationService emailNotificationService;
    private final ObjectMapper objectMapper;

    // Track retry attempts per event ID to implement backoff
    private final ConcurrentHashMap<Long, AtomicInteger> retryCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Long> lastAttemptTimes = new ConcurrentHashMap<>();

    @Scheduled(fixedDelayString = "${uptime.outbox.poll-interval-ms:10000}")
    public void processOutboxEvents() {
        var unprocessedEvents = outboxEventRepository.findUnprocessedEvents();

        if (unprocessedEvents.isEmpty()) {
            return;
        }

        log.info("Processing {} outbox events", unprocessedEvents.size());

        for (OutboxEvent event : unprocessedEvents) {
            int attempt = retryCounts.computeIfAbsent(event.getId(), id -> new AtomicInteger(0)).incrementAndGet();
            long now = System.currentTimeMillis();

            // Exponential backoff: skip if not enough time has passed since the LAST attempt
            // attempt 1: immediate, attempt 2: ~10s, attempt 3: ~20s, attempt 4: ~40s, etc.
            if (attempt > 1) {
                long lastAttempt = lastAttemptTimes.getOrDefault(event.getId(), 0L);
                long backoffMs = (long) (10000 * Math.pow(2, attempt - 2));
                if (now - lastAttempt < backoffMs) {
                    log.debug("Skipping outbox event {} (attempt {}, backoff {}ms)", event.getId(), attempt, backoffMs);
                    continue;
                }
            }

            // Record attempt time BEFORE processing so backoff uses it on next tick
            lastAttemptTimes.put(event.getId(), now);

            try {
                processEvent(event);
                markProcessed(event.getId());
                cleanup(event.getId());
                log.info("Successfully processed outbox event {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to process outbox event {} (attempt {}): {}", event.getId(), attempt, e.getMessage());

                // Give up after 5 attempts to avoid infinite retries
                if (attempt >= 5) {
                    log.warn("OUTBOX_DLQ: Event {} failed {} times. Marking as processed.", event.getId(), attempt);
                    markProcessed(event.getId());
                    cleanup(event.getId());
                }
            }
        }
    }

    @Transactional
    protected void markProcessed(Long eventId) {
        outboxEventRepository.markAsProcessed(eventId);
    }

    private void cleanup(Long eventId) {
        retryCounts.remove(eventId);
        lastAttemptTimes.remove(eventId);
    }

    private void processEvent(OutboxEvent event) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(event.getPayload(), Map.class);

        String eventType = event.getEventType();
        Long monitorId = Long.valueOf(payload.get("monitorId").toString());
        String recipientEmail = (String) payload.get("recipientEmail");

        // Load full Monitor entity with user association to avoid LazyInitializationException
        Monitor monitor = monitorRepository.findById(monitorId)
                .orElseThrow(() -> new RuntimeException("Monitor not found for outbox event: " + monitorId));

        switch (eventType) {
            case "MONITOR_DOWN" -> emailNotificationService.sendDownAlert(monitor, recipientEmail);
            case "MONITOR_UP" -> emailNotificationService.sendUpAlert(monitor, recipientEmail);
            default -> log.warn("Unknown event type: {}", eventType);
        }
    }
}
