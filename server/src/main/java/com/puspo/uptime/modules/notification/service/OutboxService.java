package com.puspo.uptime.modules.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.notification.entity.OutboxEvent;
import com.puspo.uptime.modules.notification.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Value("${uptime.app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    public void saveMonitorDownEvent(Monitor monitor, String recipientEmail) {
        saveEvent("MONITOR_DOWN", monitor, recipientEmail);
    }

    @Transactional
    public void saveMonitorUpEvent(Monitor monitor, String recipientEmail) {
        saveEvent("MONITOR_UP", monitor, recipientEmail);
    }

    private void saveEvent(String eventType, Monitor monitor, String recipientEmail) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("monitorId", monitor.getId());
            payload.put("monitorUrl", monitor.getUrl());
            payload.put("method", monitor.getMethod());
            payload.put("recipientEmail", recipientEmail);
            payload.put("baseUrl", baseUrl);

            OutboxEvent event = OutboxEvent.builder()
                    .eventType(eventType)
                    .payload(objectMapper.writeValueAsString(payload))
                    .createdAt(LocalDateTime.now())
                    .build();

            outboxEventRepository.save(event);
            log.info("Saved outbox event {} for monitor {}", eventType, monitor.getId());
        } catch (Exception e) {
            log.error("Failed to save outbox event for monitor {}: {}", monitor.getId(), e.getMessage());
        }
    }
}
