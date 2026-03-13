package com.puspo.uptime.modules.alert.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.puspo.uptime.modules.alert.dto.AlertResponse;
import com.puspo.uptime.modules.alert.dto.IncidentResponse;
import com.puspo.uptime.modules.alert.entity.Alert;
import com.puspo.uptime.modules.alert.entity.Incident;
import com.puspo.uptime.modules.alert.repository.AlertRepository;
import com.puspo.uptime.modules.alert.repository.IncidentRepository;
import com.puspo.uptime.modules.alert.service.AlertService;
import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.entity.Monitor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {
    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final MonitorLogRepository monitorLogRepository;

    @Override
    public void evaluateMonitorRules(Monitor monitor) {
        log.info("Evaluating alert rules for Monitor ID {} -> {}", monitor.getId(), monitor.getUrl());
        List<MonitorLog> monitorLogList = monitorLogRepository.findTop3ByMonitorIdOrderByCreatedAtDesc(monitor.getId());
        // Check for existing open incident
        Optional<Incident> openIncident = incidentRepository
                .findTopByMonitorIdAndResolvedAtIsNullOrderByOpenedAtDesc(monitor.getId());

        if (monitorLogList.isEmpty()) {
            return;
        }

        MonitorLog latestLog = monitorLogList.get(0);
        if ("UP".equalsIgnoreCase(latestLog.getStatus())) {
            openIncident.ifPresent(incident -> resolveIncident(monitor, incident, latestLog.getCreatedAt()));
            return;
        }

        if (monitorLogList.size() < 3) {
            return;
        }

        boolean allDown = monitorLogList.stream()
                .allMatch(monitorLog -> "DOWN".equalsIgnoreCase(monitorLog.getStatus()));
        if (allDown && openIncident.isEmpty()) {
            openIncident(monitor, latestLog.getCreatedAt());
        }
    }

    private void openIncident(Monitor monitor, LocalDateTime openedAt) {
        Incident incident = Incident.builder()
                .monitor(monitor)
                .openedAt(openedAt)
                .build();
        incidentRepository.save(incident);

        String alertMessage = String.format("URGENT: Monitor [%s] %s has failed 3 consecutive checks and is currently" +
                " DOWN.", monitor.getMethod(), monitor.getUrl());
        log.warn("🚨 ALERT TRIGGERED: {}", alertMessage);

        saveAlert(monitor, alertMessage);
    }

    private void resolveIncident(Monitor monitor, Incident incident, LocalDateTime resolvedAt) {
        incident.setResolvedAt(resolvedAt);
        incidentRepository.save(incident);

        String recoveryMessage = String.format("RECOVERY: Monitor [%s] %s is back UP.",
                monitor.getMethod(), monitor.getUrl());
        log.info("Incident resolved for monitor {}", monitor.getId());

        saveAlert(monitor, recoveryMessage);
    }

    private void saveAlert(Monitor monitor, String alertMessage) {
        Alert alert = Alert.builder()
                .monitor(monitor)
                .message(alertMessage)
                .build();
        alertRepository.save(alert);
    }

    @Override
    public List<AlertResponse> getRecentAlerts(User user) {
        List<Alert> userAlerts = alertRepository.findRecentAlertsByUserId(user.getId());

        int limit = Math.min(userAlerts.size(), 50);

        return userAlerts.stream()
                .limit(limit)
                .map(
                        alert -> AlertResponse.builder()
                                .id(alert.getId())
                                .monitorId(alert.getMonitor().getId())
                                .monitorUrl(alert.getMonitor().getUrl())
                                .message(alert.getMessage())
                                .createdAt(alert.getCreatedAt())
                                .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<IncidentResponse> getRecentIncidents(User user) {
        return incidentRepository.findRecentIncidentsByUserId(user.getId()).stream()
                .limit(20)
                .map(incident -> IncidentResponse.builder()
                        .id(incident.getId())
                        .monitorId(incident.getMonitor().getId())
                        .monitorUrl(incident.getMonitor().getUrl())
                        .openedAt(incident.getOpenedAt())
                        .resolvedAt(incident.getResolvedAt())
                        .active(incident.getResolvedAt() == null)
                        .build())
                .collect(Collectors.toList());
    }
}
