package com.puspo.uptime.modules.check.worker;

import java.time.Duration;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.puspo.uptime.modules.alert.service.AlertService;
import com.puspo.uptime.modules.check.entity.MonitorLog;
import com.puspo.uptime.modules.check.repository.MonitorLogRepository;
import com.puspo.uptime.modules.monitor.entity.Monitor;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class HttpCheckWorker {
    private final WebClient webClient;
    private final MonitorLogRepository monitorLogRepository;
    private final AlertService alertService;
    private final EmailNotificationService emailNotificationService;

    public HttpCheckWorker(MonitorLogRepository monitorLogRepository, WebClient webClient, AlertService alertService, EmailNotificationService emailNotificationService) {
        this.monitorLogRepository = monitorLogRepository;
        this.webClient = webClient;
        this.alertService = alertService;
        this.emailNotificationService = emailNotificationService;
    }

    // Check the monitor
    public void check(Monitor monitor) {
        // Day 4 MVP - Just log the check execution
        log.info("Executing HTTP check for Monitor ID {} -> [{}] {}",
                monitor.getId(),
                monitor.getMethod(),
                monitor.getUrl());

        long startTime = System.currentTimeMillis();
        // Day 5 will implement the actual WebClient request and DB logging
        webClient.method(HttpMethod.valueOf(monitor.getMethod()))
                .uri(monitor.getUrl())
                .exchangeToMono(response -> {
                    long latency = System.currentTimeMillis() - startTime;
                    int statusCode = response.statusCode().value();
                    boolean isSuccess = response.statusCode().is2xxSuccessful();

                    saveLogs(monitor, isSuccess ? "UP" : "DOWN", statusCode, latency);
                    return Mono.empty(); // Empty Mono to indicate successful completion
                })
                .timeout(Duration.ofSeconds(monitor.getTimeoutSeconds()))
                .onErrorResume(error -> {
                    long latency = System.currentTimeMillis() - startTime;
                    log.error("Monitor {} failed: {}", monitor.getId(), error.getMessage());
                    saveLogs(monitor, "DOWN", null, latency);
                    return Mono.empty(); // Empty Mono to indicate successful completion
                })
                .subscribe(); // Asynchronous execution

    }

    // Save logs
    public void saveLogs(Monitor monitor, String status, Integer statusCode, Long latency) {
        //finding previous log
        MonitorLog previousLog =
                monitorLogRepository.findTopByMonitorIdOrderByCreatedAtDesc(monitor.getId())
                        .orElse(null);

        boolean wasDown = previousLog != null && "DOWN".equals(previousLog.getStatus());
        boolean isNowUp = "UP".equals(status);

        MonitorLog monitorLog = MonitorLog.builder()
                .monitor(monitor)
                .status(status)
                .statusCode(statusCode)
                .responseTime(latency)
                .build();
        monitorLogRepository.save(monitorLog);

        log.info("Saved Log: Monitor {} is {} ({}ms)", monitor.getId(), status, latency);
        //Send email notification on status change
        if (wasDown && isNowUp) {
            emailNotificationService.sendUpAlert(monitor, monitor.getUser().getEmail());
        } else if (!wasDown && "DOWN".equals(status)) {
            emailNotificationService.sendDownAlert(monitor, monitor.getUser().getEmail());
        }

        // Evaluate if an alert should be triggered based on this new log!
        alertService.evaluateMonitorRules(monitor);
    }
}
