package com.puspo.uptime.modules.check.repository;

import com.puspo.uptime.modules.check.entity.MonitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonitorLogRepository extends JpaRepository<MonitorLog, Long> {
    //We need a custom query to fetch the last 3 logs to check if they all failed
    // Fetch the last X logs for a specific monitor, ordered by newest first
    List<MonitorLog> findTop3ByMonitorIdOrderByCreatedAtDesc(Long monitorId);
}
