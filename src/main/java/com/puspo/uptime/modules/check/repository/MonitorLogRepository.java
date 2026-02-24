package com.puspo.uptime.modules.check.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puspo.uptime.modules.check.entity.MonitorLog;

@Repository
public interface MonitorLogRepository extends JpaRepository<MonitorLog, Long> {
    // We need a custom query to fetch the last 3 logs to check if they all failed
    // Fetch the last X logs for a specific monitor, ordered by newest first
    List<MonitorLog> findTop3ByMonitorIdOrderByCreatedAtDesc(Long monitorId);

    // Get all logs for a specific monitor within time frame
    List<MonitorLog> findAllByMonitorIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long monitorId,
            LocalDateTime start,
            LocalDateTime end);

    // Get latencies for percentile calculation without loading heavy entities
    @Query(value = """
            SELECT response_time
            FROM monitor_logs
            WHERE monitor_id = :monitorId AND create_at >= :startTime AND response_time IS NOT NULL ORDER BY response_time ASC
            """, nativeQuery = true)
    List<Long> findLatenciesByMonitorIdSince(@Param("monitorId") Long monitorId,
            @Param("startTime") LocalDateTime startTime);
}
