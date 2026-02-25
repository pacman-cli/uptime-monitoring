package com.puspo.uptime.modules.monitor.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.dto.MetricsResponse;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.monitor.dto.MonitorRequest;
import com.puspo.uptime.modules.monitor.dto.MonitorResponse;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.monitor.repository.MonitorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MonitorService {

    private final MonitorRepository monitorRepository;
    private final MonitorLogRepository monitorLogRepository;

    public MonitorResponse createMonitor(MonitorRequest request, User user) {
        validateMonitorRules(request);

        Monitor monitor = Monitor.builder()
                .user(user)
                .url(request.getUrl())
                .method(request.getMethod())
                .intervalSeconds(request.getIntervalSeconds())
                .timeoutSeconds(request.getTimeoutSeconds())
                .active(request.getActive())
                .build();

        return mapToResponse(monitorRepository.save(monitor));
    }

    public List<MonitorResponse> getAllMonitors(User user) {
        return monitorRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MonitorResponse getMonitorById(Long id, User user) {
        Monitor monitor = monitorRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Monitor not found or unauthorized"));
        return mapToResponse(monitor);
    }

    public void deleteMonitor(Long id, User user) {
        Monitor monitor = monitorRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Monitor not found or unauthorized"));
        monitorRepository.delete(monitor);
    }

    public void updateMonitor(Long id, MonitorRequest request, User user) {
        Monitor monitor = monitorRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Monitor Not found or unauthorized"));

        validateMonitorRules(request);

        monitor.setUrl(request.getUrl());
        monitor.setMethod(request.getMethod());
        monitor.setIntervalSeconds(request.getIntervalSeconds());
        monitor.setTimeoutSeconds(request.getTimeoutSeconds());
        monitor.setActive(request.getActive());
        monitorRepository.save(monitor);
    }

    private void validateMonitorRules(MonitorRequest request) {
        if (request.getTimeoutSeconds() > request.getIntervalSeconds()) {
            throw new IllegalArgumentException("Timeout cannot be greater than interval");
        }
    }

    // getting monitor metrics and percentile
    public MetricsResponse getMonitorMetrics(Long monitorId, User user, int hoursBack) {
        // Enforce security: User must own the monitor
        Monitor monitor = monitorRepository.findByIdAndUserId(monitorId, user.getId())
                .orElseThrow(() -> new RuntimeException("Monitor not found or unauthorized"));

        LocalDateTime startTime = LocalDateTime.now().minusHours(hoursBack);
        LocalDateTime endTime = LocalDateTime.now();

        // 1. Calculate Uptime : find out logs ,total checks ,(filter)successfull checks, uptime percentage
        List<MonitorLog> logs = monitorLogRepository.findAllByMonitorIdAndCreatedAtBetweenOrderByCreatedAtDesc(monitorId,
                startTime,
                endTime);

        long totalChecks = logs.size();
        long successfulChecks = logs.stream()
                .filter(log -> "UP".equalsIgnoreCase(log.getStatus())).count();
        double uptimePercentage = totalChecks == 0 ? 0.0 : ((double) successfulChecks / totalChecks) * 100.0;

        // 2. Calculate Latency Metrics (using our optimized native query)
        List<Long> latencies = monitorLogRepository.findLatenciesByMonitorIdSince(monitorId, startTime);

        long p50 = calculatePercentile(latencies, 50);
        long p95 = calculatePercentile(latencies, 95);
        long p99 = calculatePercentile(latencies, 99);
        long avg = latencies.isEmpty() ? 0 : (long) latencies.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        return MetricsResponse.builder()
                .monitorId(monitor.getId())
                .url(monitor.getUrl())
                .totalChecks(totalChecks)
                .successfulChecks(successfulChecks)
                .uptimePercentage((double) Math.round(uptimePercentage * 100) / 100)
                .p50LatencyMs(p50)
                .p95LatencyMs(p95)
                .p99LatencyMs(p99)
                .averageLatencyMs(avg)
                .build();
    }


    // TODO: Mapper but we need to refactor it in a mapper folder and make the methods inside the class static
    private MonitorResponse mapToResponse(Monitor monitor) {
        return MonitorResponse.builder()
                .id(monitor.getId())
                .url(monitor.getUrl())
                .method(monitor.getMethod())
                .intervalSeconds(monitor.getIntervalSeconds())
                .timeoutSeconds(monitor.getTimeoutSeconds())
                .active(monitor.getActive())
                .createdAt(monitor.getCreatedAt())
                .updatedAt(monitor.getUpdatedAt())
                .build();
    }

    // helper function
    private long calculatePercentile(List<Long> latencies, int percentile) {
        if (latencies == null || latencies.isEmpty()) {
            return 0;
        }

        int index = (int) Math.ceil((percentile / 100.0) * latencies.size()) - 1;
        index = Math.max(0, Math.min(index, latencies.size() - 1));

        return latencies.get(index);
    }
}
