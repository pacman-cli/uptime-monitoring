package com.puspo.uptime.modules.monitor.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.puspo.uptime.common.response.PaginatedResponse;
import com.puspo.uptime.modules.monitor.entity.IdempotencyKey;
import com.puspo.uptime.modules.monitor.repository.IdempotencyKeyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Transactional
    public MonitorResponse createMonitor(MonitorRequest request, User user, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existingKey = idempotencyKeyRepository.findByKeyAndNotExpired(idempotencyKey, LocalDateTime.now());
            if (existingKey.isPresent()) {
                Monitor existing = monitorRepository.findById(existingKey.get().getMonitorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Monitor not found"));
                return mapToResponse(existing);
            }
        }

        validateMonitorRules(request);

        Monitor monitor = Monitor.builder()
                .user(user)
                .name(request.getName())
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

        Monitor saved = monitorRepository.save(monitor);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            IdempotencyKey key = IdempotencyKey.builder()
                    .key(idempotencyKey)
                    .monitorId(saved.getId())
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            idempotencyKeyRepository.save(key);
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MonitorResponse> getAllMonitors(User user) {
        List<Monitor> monitors = monitorRepository.findAllByUserId(user.getId());

        if (monitors.isEmpty()) {
            return List.of();
        }

        // Batch-fetch last check for all monitors (eliminates N+1 queries from the frontend)
        List<Long> monitorIds = monitors.stream()
                .map(Monitor::getId)
                .collect(Collectors.toList());

        List<MonitorLog> latestLogs = monitorLogRepository.findLatestPerMonitorId(monitorIds);
        Map<Long, MonitorLog> logByMonitorId = latestLogs.stream()
                .collect(Collectors.toMap(
                        log -> log.getMonitor().getId(),
                        log -> log,
                        (a, b) -> a
                ));

        return monitors.stream()
                .map(monitor -> {
                    MonitorResponse response = mapToResponse(monitor);
                    MonitorLog latestLog = logByMonitorId.get(monitor.getId());
                    if (latestLog != null) {
                        response.setLastCheck(MonitorLogResponse.builder()
                                .status(latestLog.getStatus())
                                .statusCode(latestLog.getStatusCode())
                                .responseTimeMs(latestLog.getResponseTime())
                                .checkedAt(latestLog.getCreatedAt())
                                .build());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    public PaginatedResponse<MonitorResponse> getAllMonitorsPaginated(User user, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by("createdAt").descending());
        Page<Monitor> monitorPage = monitorRepository.findByUserId(user.getId(), pageable);

        List<MonitorResponse> data = monitorPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        PaginatedResponse.Pagination pagination = PaginatedResponse.Pagination.builder()
                .page(page)
                .pageSize(pageSize)
                .totalItems(monitorPage.getTotalElements())
                .totalPages(monitorPage.getTotalPages())
                .hasNext(monitorPage.hasNext())
                .hasPrev(monitorPage.hasPrevious())
                .build();

        return PaginatedResponse.<MonitorResponse>builder()
                .data(data)
                .pagination(pagination)
                .build();
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
                .name(monitor.getName())
                .url(monitor.getUrl())
                .method(monitor.getMethod())
                .intervalSeconds(monitor.getIntervalSeconds())
                .timeoutSeconds(monitor.getTimeoutSeconds())
                .active(monitor.getActive())
                .expectedBodyContains(monitor.getExpectedBodyContains())
                .expectedStatusCodes(monitor.getExpectedStatusCodes())
                .checkSslExpiration(monitor.getCheckSslExpiration())
                .sslExpiryDaysThreshold(monitor.getSslExpiryDaysThreshold())
                .createdAt(monitor.getCreatedAt())
                .updatedAt(monitor.getUpdatedAt())
                .build();
    }

    // helper function - sorts input before computing percentile
    private long calculatePercentile(List<Long> latencies, int percentile) {
        if (latencies == null || latencies.isEmpty()) {
            return 0;
        }

        // Sort ascending to ensure correct percentile calculation
        List<Long> sorted = new ArrayList<>(latencies);
        Collections.sort(sorted);

        int index = (int) Math.ceil((percentile / 100.0) * sorted.size()) - 1;
        index = Math.max(0, Math.min(index, sorted.size() - 1));

        return sorted.get(index);
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
