package com.puspo.uptime.modules.check.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.puspo.uptime.modules.check.service.CheckService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MonitorScheduler {

  private final CheckService checkService;

  @Scheduled(fixedDelayString = "${uptime.scheduler.poll-interval-ms:30000}")
  public void executeDueMonitorChecks() {
    log.info("Scheduler triggered. Executing due monitor checks...");
    try {
      checkService.processDueActiveMonitors();
    } catch (Exception e) {
      log.error("Error occurred while executing scheduled monitor checks", e);
    }
  }
}

// Chain of Responsibility Pattern
// MonitorScheduler -> CheckService inside processAllActiveMonitors method ->
// HttpCheckWorker inside check method (check method will execute the actual
// check)
