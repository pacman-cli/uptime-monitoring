package com.puspo.uptime.modules.monitor.controller;

import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.monitor.dto.MetricsResponse;
import com.puspo.uptime.modules.monitor.service.MonitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
public class MetricsController {

    private final MonitorService monitorService;

    public MetricsController(MonitorService monitorService) {
        this.monitorService = monitorService;
    }

    @GetMapping("/monitor/{monitorId}")
    public ResponseEntity<MetricsResponse> getMonitorMetrics(
            @PathVariable Long monitorId,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "24") int hoursBack) {
        return ResponseEntity.ok(monitorService.getMonitorMetrics(monitorId, user, hoursBack));
    }
}
