package com.puspo.uptime.modules.alert.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puspo.uptime.modules.alert.entity.Incident;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Optional<Incident> findTopByMonitorIdAndResolvedAtIsNullOrderByOpenedAtDesc(Long monitorId);

    @Query(
        """
        SELECT i
        FROM Incident i
        JOIN i.monitor m
        WHERE m.user.id = :userId
        ORDER BY COALESCE(i.resolvedAt, i.openedAt) DESC, i.openedAt DESC
        """
    )
    List<Incident> findRecentIncidentsByUserId(@Param("userId") Long userId);
}