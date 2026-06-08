package com.puspo.uptime.config;

import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;

@Configuration
public class WebClientConfig {

  private ConnectionProvider connectionProvider;

  @Bean
  public WebClient webClient() {
    this.connectionProvider = ConnectionProvider.builder("uptime-http")
        .maxConnections(50)
        .maxIdleTime(Duration.ofSeconds(30))
        .pendingAcquireTimeout(Duration.ofSeconds(10))
        .build();

    HttpClient httpClient = HttpClient.create(connectionProvider)
        .responseTimeout(Duration.ofSeconds(30));

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
  }

  @PreDestroy
  public void shutdown() {
    if (connectionProvider != null) {
      connectionProvider.dispose();
    }
  }
}
