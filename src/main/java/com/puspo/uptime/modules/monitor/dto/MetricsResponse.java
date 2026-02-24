package com.puspo.uptime.modules.monitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MetricsResponse {
  private Long monitorId;
  private String url;
  private Long totalChecks;
  private Long successfulChecks;
  private Double uptimePercentage;

  // Percentiles of response time
  private Double p50LatencyMs;
  private Double p95LatencyMs;
  private Double p99LatencyMs;
  private Double averageLatencyMs;
}
