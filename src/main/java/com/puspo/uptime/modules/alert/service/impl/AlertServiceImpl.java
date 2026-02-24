package com.puspo.uptime.modules.alert.service.impl;

import com.puspo.uptime.modules.alert.entity.Alert;
import com.puspo.uptime.modules.alert.repository.AlertRepository;
import com.puspo.uptime.modules.alert.service.AlertService;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AlertServiceImpl implements AlertService {
    private final AlertRepository alertRepository;
    private final MonitorLogRepository monitorLogRepository;

    AlertServiceImpl(AlertRepository alertRepository, MonitorLogRepository monitorLogRepository) {
        this.alertRepository = alertRepository;
        this.monitorLogRepository = monitorLogRepository;
    }

    @Override
    public void evaluateMonitorRules(Monitor monitor) {
        log.info("Evaluating alert rules for Monitor ID {} -> {}", monitor.getId(), monitor.getUrl());
        // Fetch the last 3 logs
        List<MonitorLog> monitorLogList = monitorLogRepository.findTop3ByMonitorIdOrderByCreatedAtDesc(monitor.getId());

        // If we don't even have 3 checks yet, just return
        if (monitorLogList.size() < 3) {
            return;
        }
        // Check if ALL 3 recent logs have a status of "DOWN"
        boolean allDown = monitorLogList.stream()
                .allMatch(log -> log.getStatus().equals("DOWN"));
        if (allDown) {
            // triggerAlert
            triggerAlert(monitor);
        }

    }

    @Override
    public void triggerAlert(Monitor monitor) {
        String alertMessage = String.format("URGENT: Monitor [%s] %s has failed 3 consecutive checks and is currently" +
                " DOWN.", monitor.getMethod(), monitor.getUrl());

        log.warn("🚨 ALERT TRIGGERED: {}", alertMessage);

        Alert alert = Alert.builder()
                .monitor(monitor)
                .message(alertMessage)
                .build();
        alertRepository.save(alert);
        // In the future this is where i can  trigger an email/slack integration!
    }
}
