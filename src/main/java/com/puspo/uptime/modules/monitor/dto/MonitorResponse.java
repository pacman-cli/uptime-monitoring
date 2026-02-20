package com.puspo.uptime.modules.monitor.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonitorResponse {
  private Long id;
  private String url;
  private String method;
  private Integer intervalSeconds;
  private Integer timeoutSeconds;
  private Boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
