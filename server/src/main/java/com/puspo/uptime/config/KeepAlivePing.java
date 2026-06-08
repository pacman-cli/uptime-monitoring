package com.puspo.uptime.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class KeepAlivePing {

    private static final Logger log = LoggerFactory.getLogger(KeepAlivePing.class);
    private final WebClient webClient;
    private final String externalUrl;

    public KeepAlivePing(WebClient.Builder builder,
                         @Value("${uptime.keepalive.external-url:}") String externalUrl) {
        this.externalUrl = externalUrl;
        this.webClient = builder.build();
    }

    @Scheduled(fixedDelayString = "${uptime.keepalive.interval-ms:600000}")
    public void ping() {
        if (externalUrl == null || externalUrl.isBlank()) {
            return;
        }
        try {
            webClient.get()
                    .uri(externalUrl + "/actuator/health")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Keep-alive ping successful");
        } catch (Exception e) {
            log.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
