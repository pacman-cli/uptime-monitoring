package com.puspo.uptime.modules.alert.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.puspo.uptime.modules.alert.entity.Alert;
import com.puspo.uptime.modules.alert.entity.Incident;
import com.puspo.uptime.modules.alert.repository.AlertRepository;
import com.puspo.uptime.modules.alert.repository.IncidentRepository;
import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.entity.Monitor;

@ExtendWith(MockitoExtension.class)
class AlertServiceImplTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private MonitorLogRepository monitorLogRepository;

    @InjectMocks
    private AlertServiceImpl alertService;

    @Test
    void evaluateMonitorRulesCreatesIncidentAndAlertAfterThreeFailures() {
        Monitor monitor = monitor();
        LocalDateTime now = LocalDateTime.now();

        when(monitorLogRepository.findTop3ByMonitorIdOrderByCreatedAtDesc(monitor.getId()))
                .thenReturn(List.of(
                        log(monitor, now, "DOWN"),
                        log(monitor, now.minusMinutes(1), "DOWN"),
                        log(monitor, now.minusMinutes(2), "DOWN")));
        when(incidentRepository.findTopByMonitorIdAndResolvedAtIsNullOrderByOpenedAtDesc(monitor.getId()))
                .thenReturn(Optional.empty());

        alertService.evaluateMonitorRules(monitor);

        ArgumentCaptor<Incident> incidentCaptor = ArgumentCaptor.forClass(Incident.class);
        ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);

        verify(incidentRepository).save(incidentCaptor.capture());
        verify(alertRepository).save(alertCaptor.capture());

        assertThat(incidentCaptor.getValue().getMonitor()).isEqualTo(monitor);
        assertThat(incidentCaptor.getValue().getOpenedAt()).isEqualTo(now);
        assertThat(incidentCaptor.getValue().getResolvedAt()).isNull();
        assertThat(alertCaptor.getValue().getMessage()).contains("failed 3 consecutive checks");
    }

    @Test
    void evaluateMonitorRulesDoesNotCreateDuplicateAlertWhenIncidentAlreadyOpen() {
        Monitor monitor = monitor();
        LocalDateTime now = LocalDateTime.now();

        when(monitorLogRepository.findTop3ByMonitorIdOrderByCreatedAtDesc(monitor.getId()))
                .thenReturn(List.of(
                        log(monitor, now, "DOWN"),
                        log(monitor, now.minusMinutes(1), "DOWN"),
                        log(monitor, now.minusMinutes(2), "DOWN")));
        when(incidentRepository.findTopByMonitorIdAndResolvedAtIsNullOrderByOpenedAtDesc(monitor.getId()))
                .thenReturn(Optional.of(Incident.builder()
                        .id(11L)
                        .monitor(monitor)
                        .openedAt(now.minusHours(1))
                        .build()));

        alertService.evaluateMonitorRules(monitor);

        verify(incidentRepository, never()).save(any(Incident.class));
        verify(alertRepository, never()).save(any(Alert.class));
    }

    @Test
    void evaluateMonitorRulesResolvesIncidentAndCreatesRecoveryAlert() {
        Monitor monitor = monitor();
        LocalDateTime now = LocalDateTime.now();
        Incident incident = Incident.builder()
                .id(9L)
                .monitor(monitor)
                .openedAt(now.minusHours(2))
                .build();

        when(monitorLogRepository.findTop3ByMonitorIdOrderByCreatedAtDesc(monitor.getId()))
                .thenReturn(List.of(log(monitor, now, "UP")));
        when(incidentRepository.findTopByMonitorIdAndResolvedAtIsNullOrderByOpenedAtDesc(monitor.getId()))
                .thenReturn(Optional.of(incident));

        alertService.evaluateMonitorRules(monitor);

        ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);

        verify(incidentRepository).save(incident);
        verify(alertRepository).save(alertCaptor.capture());

        assertThat(incident.getResolvedAt()).isEqualTo(now);
        assertThat(alertCaptor.getValue().getMessage()).contains("back UP");
    }

    @Test
    void getRecentIncidentsMapsOpenAndResolvedIncidents() {
        User user = User.builder().id(42L).email("ops@example.com").password("secret").build();
        Monitor monitor = monitor();
        LocalDateTime now = LocalDateTime.now();

        Incident openIncident = Incident.builder()
                .id(1L)
                .monitor(monitor)
                .openedAt(now.minusMinutes(30))
                .build();
        Incident resolvedIncident = Incident.builder()
                .id(2L)
                .monitor(monitor)
                .openedAt(now.minusHours(4))
                .resolvedAt(now.minusHours(3))
                .build();

        when(incidentRepository.findRecentIncidentsByUserId(user.getId()))
                .thenReturn(List.of(openIncident, resolvedIncident));

        var incidents = alertService.getRecentIncidents(user);

        assertThat(incidents).hasSize(2);
        assertThat(incidents.get(0).isActive()).isTrue();
        assertThat(incidents.get(0).getMonitorUrl()).isEqualTo(monitor.getUrl());
        assertThat(incidents.get(1).isActive()).isFalse();
        assertThat(incidents.get(1).getResolvedAt()).isEqualTo(resolvedIncident.getResolvedAt());
    }

    private Monitor monitor() {
        return Monitor.builder()
                .id(1L)
                .url("https://status.example.com")
                .method("GET")
                .intervalSeconds(60)
                .timeoutSeconds(10)
                .active(true)
                .build();
    }

    private MonitorLog log(Monitor monitor, LocalDateTime createdAt, String status) {
        MonitorLog monitorLog = MonitorLog.builder()
                .monitor(monitor)
                .status(status)
                .statusCode("UP".equals(status) ? 200 : 503)
                .responseTime(150L)
                .build();
        monitorLog.setCreatedAt(createdAt);
        return monitorLog;
    }
}