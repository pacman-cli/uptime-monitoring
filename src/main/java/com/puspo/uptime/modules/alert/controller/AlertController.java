package com.puspo.uptime.modules.alert.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.puspo.uptime.modules.alert.dto.AlertResponse;
import com.puspo.uptime.modules.alert.service.AlertService;
import com.puspo.uptime.modules.auth.entity.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

  private final AlertService alertService;

  @GetMapping
  public ResponseEntity<List<AlertResponse>> getRecentAlerts(
      @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(alertService.getRecentAlerts(user));
  }
}
