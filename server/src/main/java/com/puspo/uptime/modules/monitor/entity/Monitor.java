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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
  private String name;

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

  // adding new fields
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  private String headers;

  @Column(name = "expected_status_codes", length = 100)
  private String expectedStatusCodes;

  @Column(name = "expected_body_contains", length = 500)
  private String expectedBodyContains;

  @Column(name = "check_ssl_expiration")
  private Boolean checkSslExpiration;

  @Column(name = "ssl_expiry_days_threshold")
  private Integer sslExpiryDaysThreshold;
}
