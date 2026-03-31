package com.puspo.uptime.modules.monitor.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.puspo.uptime.common.exception.ResourceNotFoundException;
import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.check.dto.MonitorLogResponse;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.metrics.MetricsResponse;
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
                .expectedBodyContains(request.getExpectedBodyContains())
                .expectedStatusCodes(request.getExpectedStatusCodes())
                .checkSslExpiration(request.getCheckSslExpiration() != null ? request.getCheckSslExpiration() : false)
                .sslExpiryDaysThreshold(request.getSslExpiryDaysThreshold() != null ? request.getSslExpiryDaysThreshold() : 30)
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
        return mapToResponse(getOwnedMonitor(id, user));
    }

    public void deleteMonitor(Long id, User user) {
        monitorRepository.delete(getOwnedMonitor(id, user));
    }

    public void updateMonitor(Long id, MonitorRequest request, User user) {
        Monitor monitor = getOwnedMonitor(id, user);

        validateMonitorRules(request);

        monitor.setUrl(request.getUrl());
        monitor.setMethod(request.getMethod());
        monitor.setIntervalSeconds(request.getIntervalSeconds());
        monitor.setTimeoutSeconds(request.getTimeoutSeconds());
        monitor.setActive(request.getActive());
        monitor.setExpectedBodyContains(request.getExpectedBodyContains());
        monitor.setExpectedStatusCodes(request.getExpectedStatusCodes());
        monitor.setCheckSslExpiration(request.getCheckSslExpiration() != null ? request.getCheckSslExpiration() : false);
        monitor.setSslExpiryDaysThreshold(request.getSslExpiryDaysThreshold() != null ? request.getSslExpiryDaysThreshold() : 30);
        monitorRepository.save(monitor);
    }

    private void validateMonitorRules(MonitorRequest request) {
        if (request.getTimeoutSeconds() > request.getIntervalSeconds()) {
            throw new IllegalArgumentException("Timeout cannot be greater than interval");
        }
    }

    public MonitorLogResponse getLastCheck(Long monitorId, User user) {
        getOwnedMonitor(monitorId, user);

        return monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(monitorId)
                .map(log -> MonitorLogResponse.builder()
                        .status(log.getStatus())
                        .statusCode(log.getStatusCode())
                        .responseTimeMs(
                                log.getResponseTime()
                        )
                        .checkedAt(log.getCreatedAt())
                        .build())
                .orElse(MonitorLogResponse.builder()
                        .status("PENDING")
                        .build());
    }

    // getting monitor metrics and percentile
    public MetricsResponse getMonitorMetrics(Long monitorId, User user, int hoursBack) {
        Monitor monitor = getOwnedMonitor(monitorId, user);

        LocalDateTime startTime = LocalDateTime.now().minusHours(hoursBack);
        LocalDateTime endTime = LocalDateTime.now();

        // 1. Calculate Uptime : find out logs ,total checks ,(filter)successfull
        // checks, uptime percentage
        List<MonitorLog> logs = monitorLogRepository.findAllByMonitorIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                monitorId,
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
        long avg = latencies.isEmpty() ? 0
                : (long) latencies.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);

        return MetricsResponse.builder()
                .monitorId(monitor.getId())
                .url(monitor.getUrl())
                .totalChecks(totalChecks)
                .successfulChecks(successfulChecks)
                .uptimePercentage((double) Math.round(uptimePercentage * 100) / 100)
                .p50LatencyMs((double) p50)
                .p95LatencyMs((double) p95)
                .p99LatencyMs((double) p99)
                .averageLatencyMs((double) avg)
                .build();
    }

    // TODO: Mapper but we need to refactor it in a mapper folder and make the
    // methods inside the class static
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

    public List<MonitorLogResponse> getMonitorHistory(Long monitorId, User user, int hoursBack) {
        getOwnedMonitor(monitorId, user);

        LocalDateTime startTime = LocalDateTime.now().minusHours(hoursBack);
        LocalDateTime endTime = LocalDateTime.now();

        List<MonitorLog> logs = monitorLogRepository
                .findAllByMonitorIdAndCreatedAtBetweenOrderByCreatedAtDesc(monitorId, startTime, endTime);

        return logs.stream()
                .map(log -> MonitorLogResponse.builder()
                        .status(log.getStatus())
                        .statusCode(log.getStatusCode())
                        .responseTimeMs(log.getResponseTime())
                        .checkedAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    //like mapper but in a different way, its a helper function to get the monitor and check if the user is the owner of the monitor
        private Monitor getOwnedMonitor(Long monitorId, User user) {
                return monitorRepository.findByIdAndUserId(monitorId, user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Monitor not found"));
        }

}