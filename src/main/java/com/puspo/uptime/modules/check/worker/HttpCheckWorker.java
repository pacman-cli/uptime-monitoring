package com.puspo.uptime.modules.check.worker;

import org.springframework.stereotype.Component;

import com.puspo.uptime.modules.monitor.entity.Monitor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class HttpCheckWorker {

  public void check(Monitor monitor) {
    // Day 4 MVP - Just log the check execution
    log.info("Executing HTTP check for Monitor ID {} -> [{}] {}",
        monitor.getId(),
        monitor.getMethod(),
        monitor.getUrl());

    // Day 5 will implement the actual WebClient request and DB logging
  }
}
