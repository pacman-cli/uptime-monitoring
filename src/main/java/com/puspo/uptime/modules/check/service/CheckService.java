package com.puspo.uptime.modules.check.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
  private final HttpCheckWorker httpCheckWorker;

  public void processAllActiveMonitors() {
    log.info("Starting schedule to check all active monitors...");

    // Find all monitors across all users that are active
    // For MVP, we can iterate all. Or we need a query method in repository.
    // Let's create a custom method in MonitorRepository

    // Wait, for Day 4, I will get all active monitors
    List<Monitor> activeMonitors = monitorRepository.findByActiveTrue();

    if (activeMonitors.isEmpty()) {
      log.info("No active monitors found to check.");
      return;
    }

    log.info("Found {} active monitors. Dispatching to worker...", activeMonitors.size());
    for (Monitor monitor : activeMonitors) {
      httpCheckWorker.check(monitor);
    }

    log.info("Completed dispatching all monitor checks.");
  }
}
