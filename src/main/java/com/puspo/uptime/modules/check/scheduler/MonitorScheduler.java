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

  // Runs every 60 seconds (60000 ms)
  @Scheduled(fixedRate = 60000)
  public void executeMonitorChecks() {
    log.info("Scheduler triggered. Executing monitor checks...");
    try {
      checkService.processAllActiveMonitors();
    } catch (Exception e) {
      log.error("Error occurred while executing scheduled monitor checks", e);
    }
  }
}
