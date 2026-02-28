package com.puspo.uptime.modules.alert.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puspo.uptime.modules.alert.entity.Alert;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

  // Fetch all alerts for a specific user's monitors
  @Query(value = """
      SELECT a
      FROM Alert
      a JOIN
      a.monitor m
      WHERE m.user.id=:userId
      ORDER BY a.createdAt DESC""", nativeQuery = true)
  List<Alert> findRecentAlertsByUserId(@Param("userId") Long userId);
}
