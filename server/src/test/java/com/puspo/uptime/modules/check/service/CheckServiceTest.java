package com.puspo.uptime.modules.check.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.check.worker.HttpCheckWorker;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.monitor.repository.MonitorRepository;

@ExtendWith(MockitoExtension.class)
class CheckServiceTest {

    @Mock
    private MonitorRepository monitorRepository;

    @Mock
    private MonitorLogRepository monitorLogRepository;

    @Mock
    private HttpCheckWorker httpCheckWorker;

    @InjectMocks
    private CheckService checkService;

    @Test
    void processDueActiveMonitorsDispatchesOnlyDueMonitors() {
        Monitor neverChecked = monitor(1L, 30);
        Monitor dueMonitor = monitor(2L, 60);
        Monitor notDueMonitor = monitor(3L, 120);

        when(monitorRepository.findByActiveTrue()).thenReturn(List.of(neverChecked, dueMonitor, notDueMonitor));
        when(monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());
        when(monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(2L))
                .thenReturn(Optional.of(log(dueMonitor, LocalDateTime.now().minusSeconds(61), "UP")));
        when(monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(3L))
                .thenReturn(Optional.of(log(notDueMonitor, LocalDateTime.now().minusSeconds(30), "UP")));

        checkService.processDueActiveMonitors();

        verify(httpCheckWorker).check(neverChecked);
        verify(httpCheckWorker).check(dueMonitor);
        verify(httpCheckWorker, never()).check(notDueMonitor);
    }

    @Test
    void processDueActiveMonitorsSkipsDispatchWhenNoMonitorsAreDue() {
        Monitor notDueMonitor = monitor(5L, 120);

        when(monitorRepository.findByActiveTrue()).thenReturn(List.of(notDueMonitor));
        when(monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(5L))
                .thenReturn(Optional.of(log(notDueMonitor, LocalDateTime.now().minusSeconds(20), "UP")));

        checkService.processDueActiveMonitors();

        verify(httpCheckWorker, never()).check(notDueMonitor);
    }

    private Monitor monitor(Long id, int intervalSeconds) {
        return Monitor.builder()
                .id(id)
                .url("https://example.com/" + id)
                .method("GET")
                .intervalSeconds(intervalSeconds)
                .timeoutSeconds(10)
                .active(true)
                .build();
    }

    private MonitorLog log(Monitor monitor, LocalDateTime createdAt, String status) {
        MonitorLog log = MonitorLog.builder()
                .monitor(monitor)
                .status(status)
                .statusCode(200)
                .responseTime(100L)
                .build();
        log.setCreatedAt(createdAt);
        return log;
    }
}