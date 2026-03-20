package com.puspo.uptime.modules.notification.service;

import com.puspo.uptime.modules.monitor.entity.Monitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationService {
    private final JavaMailSender javaMailSender;

    @Value("${uptime.app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${uptime.alert.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${uptime.alert.email.from:noreply@uptime.local")
    private String fromEmail;

    // this should be an async method
    @Async
    public void sendDownAlert(Monitor monitor, String recipientEmail) {
        //check email is enabled or not
        if (!emailEnabled) {
            log.debug("Email alert is disabled, skipping sending email");
            return;
        }
        //mail message should be in try catch block
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setFrom(fromEmail);
            message.setSubject(String.format("[Alert] Monitor DOWN:%s", monitor.getUrl()));
            message.setText(buildDownAlertBody(monitor));
            javaMailSender.send(message);
            log.info("Down alert email sent for monitor {} to {}", monitor.getId(), recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send down alert email for monitor {}", monitor.getId(), e);
        }
    }

    private String buildDownAlertBody(Monitor monitor) {
        return String.format("""
                        Your monitor has gone DOWN.
                        
                        Monitor: %s
                        URL: %s
                        Method: %s
                        Time: %s
                        
                        Monitor Dashboard: %s/monitor/%d
                        
                        -UptimeMonitor
                        """,
                monitor.getUrl(), monitor.getUrl(), monitor.getMethod(), LocalDateTime.now(), baseUrl, monitor.getId());
    }
}
