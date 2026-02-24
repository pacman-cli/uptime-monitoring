package com.puspo.uptime.modules.alert.service;

import com.puspo.uptime.modules.monitor.entity.Monitor;

public interface AlertService {
    void evaluateMonitorRules(Monitor monitor);

    void triggerAlert(Monitor monitor);
}
