package com.puspo.uptime.modules.monitor.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.check.dto.MonitorLogResponse;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.dto.MonitorResponse;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.monitor.repository.MonitorRepository;

@ExtendWith(MockitoExtension.class)
class MonitorServiceTest {

    @Mock
    private MonitorRepository monitorRepository;

    @Mock
    private MonitorLogRepository monitorLogRepository;

    @InjectMocks
    private MonitorService monitorService;

    @Test
    void getAllMonitorsIncludesLastCheckWhenAvailable() {
        User user = User.builder().id(1L).email("test@example.com").password("encoded").build();
        Monitor monitor = Monitor.builder()
                .id(10L)
                .user(user)
                .name("My API")
                .url("https://api.example.com/health")
                .method("GET")
                .intervalSeconds(60)
                .timeoutSeconds(10)
                .active(true)
                .build();

        LocalDateTime checkedAt = LocalDateTime.of(2026, 6, 8, 12, 0);
        MonitorLog latestLog = MonitorLog.builder()
                .monitor(monitor)
                .status("UP")
                .statusCode(200)
                .responseTime(45L)
                .build();
        latestLog.setCreatedAt(checkedAt);

        when(monitorRepository.findAllByUserId(user.getId())).thenReturn(List.of(monitor));
        when(monitorLogRepository.findLatestPerMonitorId(List.of(10L))).thenReturn(List.of(latestLog));

        List<MonitorResponse> result = monitorService.getAllMonitors(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("My API");
        assertThat(result.get(0).getLastCheck()).isNotNull();

        MonitorLogResponse lastCheck = result.get(0).getLastCheck();
        assertThat(lastCheck.getStatus()).isEqualTo("UP");
        assertThat(lastCheck.getStatusCode()).isEqualTo(200);
        assertThat(lastCheck.getResponseTimeMs()).isEqualTo(45L);
        assertThat(lastCheck.getCheckedAt()).isEqualTo(checkedAt);
    }

    @Test
    void getAllMonitorsReturnsNullLastCheckWhenNoLogsExist() {
        User user = User.builder().id(2L).email("ops@example.com").password("encoded").build();
        Monitor monitor = Monitor.builder()
                .id(20L)
                .user(user)
                .name("New Monitor")
                .url("https://new.example.com")
                .method("GET")
                .intervalSeconds(60)
                .timeoutSeconds(10)
                .active(true)
                .build();

        when(monitorRepository.findAllByUserId(user.getId())).thenReturn(List.of(monitor));
        when(monitorLogRepository.findLatestPerMonitorId(List.of(20L))).thenReturn(List.of());

        List<MonitorResponse> result = monitorService.getAllMonitors(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLastCheck()).isNull();
    }

    @Test
    void getAllMonitorsReturnsEmptyListForUserWithNoMonitors() {
        User user = User.builder().id(3L).email("empty@example.com").password("encoded").build();

        when(monitorRepository.findAllByUserId(user.getId())).thenReturn(List.of());

        List<MonitorResponse> result = monitorService.getAllMonitors(user);

        assertThat(result).isEmpty();
    }
}
