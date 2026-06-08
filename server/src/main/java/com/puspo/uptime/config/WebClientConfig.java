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

  private HttpClient httpClient;

  @Bean
  public WebClient webClient() {
    ConnectionProvider provider = ConnectionProvider.builder("uptime-http")
        .maxConnections(50)
        .maxIdleTime(Duration.ofSeconds(30))
        .pendingAcquireTimeout(Duration.ofSeconds(10))
        .build();

    this.httpClient = HttpClient.create(provider)
        .responseTimeout(Duration.ofSeconds(30));

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
  }

  @PreDestroy
  public void shutdown() {
    if (httpClient != null) {
      httpClient.dispose();
    }
  }
}
