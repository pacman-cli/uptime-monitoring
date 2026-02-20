package com.puspo.uptime.modules.monitor.service;

import java.util.List;
import java.util.stream.Collectors;

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
}
