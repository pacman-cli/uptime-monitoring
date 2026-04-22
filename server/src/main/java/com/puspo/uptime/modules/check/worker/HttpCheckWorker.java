package com.puspo.uptime.modules.check.worker;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.puspo.uptime.modules.notification.service.EmailNotificationService;
import org.springframework.http.HttpHeaders;
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
    private final ObjectMapper objectMapper;

    public HttpCheckWorker(MonitorLogRepository monitorLogRepository, WebClient webClient, AlertService alertService, EmailNotificationService emailNotificationService, ObjectMapper objectMapper) {
        this.monitorLogRepository = monitorLogRepository;
        this.webClient = webClient;
        this.alertService = alertService;
        this.emailNotificationService = emailNotificationService;
        this.objectMapper = objectMapper;
    }

    // Check the monitor
    public void check(Monitor monitor) {
        // Day 4 MVP - Just log the check execution
        log.info("Executing HTTP check for Monitor ID {} -> [{}] {}",
                monitor.getId(),
                monitor.getMethod(),
                monitor.getUrl());

        long startTime = System.currentTimeMillis();
        WebClient.RequestHeadersSpec<?> requestHeadersSpec = webClient.method(
                HttpMethod.valueOf(monitor.getMethod())
        ).uri(monitor.getUrl());

        //If headers not null or not blank then add them{adding custom headers if configured
        if (monitor.getHeaders() != null && !monitor.getHeaders().isBlank()) {
            requestHeadersSpec = requestHeadersSpec.headers(
                    httpHeaders -> addCustomHeaders(httpHeaders, monitor.getHeaders())
            );
        }

        requestHeadersSpec.exchangeToMono(
                        response -> {
                            int statusCode = response.statusCode().value();
                            if (monitor.getExpectedBodyContains() != null && !monitor.getExpectedBodyContains().isBlank()) {
                                return response.bodyToMono(String.class)
                                        .defaultIfEmpty("")
                                        .map(body -> {
                                            processResponse(monitor, startTime, statusCode, body);
                                            return null;
                                        })
                                        .then();
                            } else {
                                processResponse(monitor, startTime, statusCode, null);
                                return Mono.empty();
                            }
                        }
                )
                .timeout(Duration.ofSeconds(monitor.getTimeoutSeconds()))
                .onErrorResume(error -> {
                    long latency = System.currentTimeMillis() - startTime;
                    log.error("Monitor {} failed: {}", monitor.getId(), error.getMessage());
                    saveLogs(monitor, "DOWN", null, latency);
                    return Mono.empty(); // Empty Mono to indicate successful completion
                })
                .subscribe();
        ;
        // Day 5 will implement the actual WebClient request and DB logging
//        webClient.method(HttpMethod.valueOf(monitor.getMethod()))
//                .uri(monitor.getUrl())
//                .exchangeToMono(response -> {
//                    long latency = System.currentTimeMillis() - startTime;
//                    int statusCode = response.statusCode().value();
//                    boolean isSuccess = response.statusCode().is2xxSuccessful();
//
//                    saveLogs(monitor, isSuccess ? "UP" : "DOWN", statusCode, latency);
//                    return Mono.empty(); // Empty Mono to indicate successful completion
//                })
//                .timeout(Duration.ofSeconds(monitor.getTimeoutSeconds()))
//                .onErrorResume(error -> {
//                    long latency = System.currentTimeMillis() - startTime;
//                    log.error("Monitor {} failed: {}", monitor.getId(), error.getMessage());
//                    saveLogs(monitor, "DOWN", null, latency);
//                    return Mono.empty(); // Empty Mono to indicate successful completion
//                })
//                .subscribe(); // Asynchronous execution

    }

    private void processResponse(Monitor monitor, long startTime, int statusCode, String body) {
        long latency = System.currentTimeMillis() - startTime;

        boolean statusValid = isStatusCodeValid(statusCode, monitor.getExpectedStatusCodes());

        boolean validBody = true;
        if (statusValid && body != null && monitor.getExpectedBodyContains() != null
                && !monitor.getExpectedBodyContains().isBlank()) {
            validBody = body.contains(monitor.getExpectedBodyContains());
            if (!validBody) {
                log.warn("Monitor {} body validation failed: expected to contain '{}'", 
                        monitor.getId(), monitor.getExpectedBodyContains());
            }
        }

        String status = (statusValid && validBody) ? "UP" : "DOWN";
        saveLogs(monitor, status, statusCode, latency);
    }



    private boolean isStatusCodeValid(int actualStatusCode, String expectedStatusCodes) {
        // If no expected codes specified, accept any 2xx status
        if (expectedStatusCodes == null || expectedStatusCodes.isBlank()) {
            return actualStatusCode >= 200 && actualStatusCode < 300;
        }
        // Parse and validate against expected status codes
        List<Integer> expectedCodes = Arrays.stream(expectedStatusCodes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .toList();
        return expectedCodes.contains(actualStatusCode);
    }

    private void addCustomHeaders(HttpHeaders httpHeaders, String headersJson) {
        try {
            Map<String, String> headerMap = objectMapper.readValue(
                    headersJson,
                    new TypeReference<Map<String, String>>() {
                    }
            );
//        headerMap.forEach(httpHeaders::add);//this can be a way
            headerMap.forEach((key, value) -> {
                httpHeaders.add(key, value);
                log.info("Added custom header: {} -> {}", key, value);
            });
        } catch (JsonProcessingException e) {
            log.error("Error parsing custom headers: {}", e.getMessage());
        }
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
