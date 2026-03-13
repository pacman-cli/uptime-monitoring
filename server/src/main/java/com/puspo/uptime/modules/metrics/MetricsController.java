package com.puspo.uptime.modules.metrics;

import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.monitor.service.MonitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestParam(defaultValue = "24") int hoursBack
    ) {
        return ResponseEntity.ok(
                monitorService.getMonitorMetrics(monitorId, user, hoursBack)
        );
    }
}
