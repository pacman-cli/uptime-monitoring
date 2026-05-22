package com.puspo.uptime.modules.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.uptime.modules.notification.entity.OutboxEvent;
import com.puspo.uptime.modules.notification.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxProcessor {

    private final OutboxEventRepository outboxEventRepository;
    private final EmailNotificationService emailNotificationService;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${uptime.outbox.poll-interval-ms:10000}")
    @Transactional
    public void processOutboxEvents() {
        var unprocessedEvents = outboxEventRepository.findUnprocessedEvents();

        if (unprocessedEvents.isEmpty()) {
            return;
        }

        log.info("Processing {} outbox events", unprocessedEvents.size());

        for (OutboxEvent event : unprocessedEvents) {
            try {
                processEvent(event);
                outboxEventRepository.markAsProcessed(event.getId());
                log.info("Successfully processed outbox event {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to process outbox event {}: {}", event.getId(), e.getMessage());
            }
        }
    }

    private void processEvent(OutboxEvent event) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(event.getPayload(), Map.class);

        String eventType = event.getEventType();
        Long monitorId = Long.valueOf(payload.get("monitorId").toString());
        String monitorUrl = (String) payload.get("monitorUrl");
        String method = (String) payload.get("method");
        String recipientEmail = (String) payload.get("recipientEmail");
        String baseUrl = (String) payload.getOrDefault("baseUrl", "http://localhost:8080");

        // Create minimal monitor object for email service
        var monitor = new com.puspo.uptime.modules.monitor.entity.Monitor();
        monitor.setId(monitorId);
        monitor.setUrl(monitorUrl);
        monitor.setMethod(method);

        // Temporarily set base URL via reflection or create a new method
        // For simplicity, we'll call the existing email methods

        switch (eventType) {
            case "MONITOR_DOWN" -> emailNotificationService.sendDownAlert(monitor, recipientEmail);
            case "MONITOR_UP" -> emailNotificationService.sendUpAlert(monitor, recipientEmail);
            default -> log.warn("Unknown event type: {}", eventType);
        }
    }
}
