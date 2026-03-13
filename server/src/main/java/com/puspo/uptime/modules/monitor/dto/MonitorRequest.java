package com.puspo.uptime.modules.monitor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonitorRequest {

  @NotBlank(message = "URL is required")
  @Pattern(regexp = "^(https?://).*$", message = "URL must start with http:// or https://")
  private String url;

  @NotBlank(message = "Method is required")
  @Pattern(regexp = "^(GET|POST|PUT|DELETE|PATCH)$", message = "Method must be a valid HTTP method")
  private String method;

  @NotNull(message = "Interval is required")
  @Min(value = 30, message = "Interval must be at least 30 seconds")
  private Integer intervalSeconds;

  @NotNull(message = "Timeout is required")
  private Integer timeoutSeconds;

  @NotNull(message = "Active status is required")
  private Boolean active;
}
