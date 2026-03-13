package com.puspo.uptime.modules.alert.service;

import java.util.List;

import com.puspo.uptime.modules.alert.dto.AlertResponse;
import com.puspo.uptime.modules.alert.dto.IncidentResponse;
import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.monitor.entity.Monitor;

public interface AlertService {
    void evaluateMonitorRules(Monitor monitor);

    List<AlertResponse> getRecentAlerts(User user);

    List<IncidentResponse> getRecentIncidents(User user);
}
