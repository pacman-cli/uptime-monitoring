package com.puspo.uptime.modules.monitor.entity;

import com.puspo.uptime.common.BaseEntity;
import com.puspo.uptime.modules.auth.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "monitors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Monitor extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private String url;

  @Column(nullable = false, length = 10)
  private String method;

  @Column(name = "interval_seconds", nullable = false)
  private Integer intervalSeconds;

  @Column(name = "timeout_seconds", nullable = false)
  private Integer timeoutSeconds;

  @Column(nullable = false)
  private Boolean active;
}
