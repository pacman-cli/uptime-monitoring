package com.puspo.uptime.modules.check.entity;

import com.puspo.uptime.common.BaseEntity;
import com.puspo.uptime.modules.monitor.entity.Monitor;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monitor_logs")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonitorLog extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monitor_id", nullable = false)
    private Monitor monitor;

    @Column(nullable = false, length = 20)
    private String status; //UP or Down

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "response_time")
    private Long responseTime;

}
