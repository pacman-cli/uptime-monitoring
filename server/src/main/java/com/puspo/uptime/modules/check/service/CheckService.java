package com.puspo.uptime.modules.check.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.check.worker.HttpCheckWorker;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import com.puspo.uptime.modules.monitor.repository.MonitorRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckService {

  private final MonitorRepository monitorRepository;
  private final MonitorLogRepository monitorLogRepository;
  private final HttpCheckWorker httpCheckWorker;

  public void processDueActiveMonitors() {
    log.info("Starting schedule to check due active monitors...");

    List<Monitor> activeMonitors = monitorRepository.findByActiveTrue();

    if (activeMonitors.isEmpty()) {
      log.info("No active monitors found to check.");
      return;
    }

    LocalDateTime referenceTime = LocalDateTime.now();
    List<Monitor> dueMonitors = activeMonitors.stream()
        .filter(monitor -> isDueForCheck(monitor, referenceTime))
        .toList();

    if (dueMonitors.isEmpty()) {
      log.info("No monitors are due for checking on this scheduler tick.");
      return;
    }

    log.info("Found {} due monitors out of {} active monitors. Dispatching to worker...", dueMonitors.size(),
        activeMonitors.size());
    for (Monitor monitor : dueMonitors) {
      httpCheckWorker.check(monitor);
    }

    log.info("Completed dispatching due monitor checks.");
  }

  private boolean isDueForCheck(Monitor monitor, LocalDateTime referenceTime) {
    return monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(monitor.getId())
        .map(MonitorLog::getCreatedAt)
        .map(lastCheckTime -> !lastCheckTime.plusSeconds(monitor.getIntervalSeconds()).isAfter(referenceTime))
        .orElse(true);
  }
}
