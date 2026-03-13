package com.puspo.uptime.modules.alert.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlertResponse {
  private Long id;
  private Long monitorId;
  private String monitorUrl;
  private String message;
  private LocalDateTime createdAt;
}
