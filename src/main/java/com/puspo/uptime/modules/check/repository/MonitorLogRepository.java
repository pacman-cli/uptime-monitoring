package com.puspo.uptime.modules.check.repository;

import com.puspo.uptime.modules.check.entity.MonitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitorLogRepository extends JpaRepository<MonitorLog, Long> {
    
}
