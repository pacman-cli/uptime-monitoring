package com.puspo.uptime.modules.monitor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.puspo.uptime.modules.monitor.entity.Monitor;

@Repository
public interface MonitorRepository extends JpaRepository<Monitor, Long> {
  List<Monitor> findAllByUserId(Long userId);

  Optional<Monitor> findByIdAndUserId(Long id, Long userId);

  List<Monitor> findByActiveTrue();

  Page<Monitor> findByUserId(Long userId, Pageable pageable);
}
