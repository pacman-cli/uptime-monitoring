package com.puspo.uptime.modules.monitor.repository;

import com.puspo.uptime.modules.monitor.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, Long> {

    Optional<IdempotencyKey> findByKey(String key);

    @Query("SELECT i FROM IdempotencyKey i WHERE i.key = :key AND i.expiresAt > :now")
    Optional<IdempotencyKey> findByKeyAndNotExpired(String key, LocalDateTime now);

    @Modifying
    @Query("DELETE FROM IdempotencyKey i WHERE i.expiresAt < :threshold")
    void deleteExpired(LocalDateTime threshold);
}
