package com.puspo.uptime.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class RenderDeployScheduler {

    private static final Logger log = LoggerFactory.getLogger(RenderDeployScheduler.class);
    private final WebClient webClient;
    private final String deployHookUrl;

    public RenderDeployScheduler(WebClient webClient,
                                 @Value("${uptime.render.deploy-hook:}") String deployHookUrl) {
        this.deployHookUrl = deployHookUrl;
        this.webClient = webClient;
    }

    // Default to every 24 hours (86400000 ms)
    @Scheduled(fixedDelayString = "${uptime.render.deploy-interval-ms:86400000}")
    public void triggerDeploy() {
        if (deployHookUrl == null || deployHookUrl.isBlank()) {
            return;
        }
        try {
            webClient.post()
                    .uri(deployHookUrl)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Render deploy hook triggered successfully");
        } catch (Exception e) {
            log.warn("Render deploy hook failed: {}", e.getMessage());
        }
    }
}
