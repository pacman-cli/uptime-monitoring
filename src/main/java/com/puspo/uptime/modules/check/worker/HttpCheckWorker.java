package com.puspo.uptime.modules.check.worker;

import java.time.Duration;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

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

    HttpCheckWorker(MonitorLogRepository monitorLogRepository, WebClient webClient) {
        this.monitorLogRepository = monitorLogRepository;
        this.webClient = webClient;
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
        MonitorLog monitorLog = MonitorLog.builder()
                .monitor(monitor)
                .status(status)
                .statusCode(statusCode)
                .responseTime(latency)
                .build();
        monitorLogRepository.save(monitorLog);
        log.info("Saved Log: Monitor {} is {} ({}ms)", monitor.getId(), status, latency);
    }
}
