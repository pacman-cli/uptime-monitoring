package com.puspo.uptime.modules.notification.repository;

import com.puspo.uptime.modules.notification.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    @Query("SELECT e FROM OutboxEvent e WHERE e.processedAt IS NULL ORDER BY e.createdAt ASC")
    List<OutboxEvent> findUnprocessedEvents();

    @Modifying
    @Query("UPDATE OutboxEvent e SET e.processedAt = CURRENT_TIMESTAMP WHERE e.id = :id")
    void markAsProcessed(Long id);
}
