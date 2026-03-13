package com.puspo.uptime.modules.monitor.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.check.dto.MonitorLogResponse;
import com.puspo.uptime.modules.monitor.dto.MonitorRequest;
import com.puspo.uptime.modules.monitor.dto.MonitorResponse;
import com.puspo.uptime.modules.monitor.service.MonitorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/monitors")
@RequiredArgsConstructor
public class MonitorController {

    private final MonitorService monitorService;

    @PostMapping
    public ResponseEntity<MonitorResponse> createMonitor(
            @Valid @RequestBody MonitorRequest request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(monitorService.createMonitor(request, user), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MonitorResponse>> getAllMonitors(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(monitorService.getAllMonitors(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MonitorResponse> getMonitorById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(monitorService.getMonitorById(id, user));
    }

    @GetMapping("/{id}/last-check")
    public ResponseEntity<MonitorLogResponse> getLastCheck(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ){
        return ResponseEntity.ok(monitorService.getLastCheck(id,user));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<MonitorLogResponse>> getMonitorHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "24") int hoursBack) {
        return ResponseEntity.ok(monitorService.getMonitorHistory(id, user, hoursBack));
    }


    @PutMapping("/{id}")
    public ResponseEntity<Void> updateMonitor(
            @PathVariable Long id,
            @Valid @RequestBody MonitorRequest request,
            @AuthenticationPrincipal User user) {
        monitorService.updateMonitor(id, request, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonitor(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        monitorService.deleteMonitor(id, user);
        return ResponseEntity.noContent().build();
    }
}
