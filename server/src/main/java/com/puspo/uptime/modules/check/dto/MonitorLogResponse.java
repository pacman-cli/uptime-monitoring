package com.puspo.uptime.modules.check.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonitorLogResponse {
    private String status;
    private Integer statusCode;
    private Long responseTimeMs;
    private LocalDateTime checkedAt;


}
