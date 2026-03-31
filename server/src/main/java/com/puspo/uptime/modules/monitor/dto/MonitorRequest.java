package com.puspo.uptime.modules.monitor.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonitorRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name;

    @NotBlank(message = "URL is required")
    @Pattern(regexp = "^(https?://).*$", message = "URL must start with http:// or https://")
    private String url;

    @NotBlank(message = "Method is required")
    @Pattern(regexp = "^(GET|POST|PUT|DELETE|PATCH)$", message = "Method must be a valid HTTP method")
    private String method;

    @NotNull(message = "Interval is required")
    @Min(value = 5, message = "Interval must be at least 5 seconds")
    @Max(value = 60, message = "Interval must be less than or equal to 60 seconds")
    private Integer intervalSeconds;

    @NotNull(message = "Timeout is required")
    @Min(value = 5, message = "Timeout must be at least 5 seconds")
    @Max(value = 60, message = "Timeout must be less than or equal to 60 seconds")
    private Integer timeoutSeconds;

    @NotNull(message = "Active status is required")
    private Boolean active;

    private String headers;

    @Pattern(regexp = "^(\\d{3}(,)?)+$", message = "Expected status codes must be a comma-separated list of 3-digit HTTP status codes")
    private String expectedStatusCodes;

    @Column(name = "expected_body_contains", length = 500)
    private String expectedBodyContains;

    private Boolean checkSslExpiration;

    @Min(value = 1, message = "SSL expiry days threshold must be at least 1 day")
    @Max(value = 365, message = "SSL expiry days threshold must be less then or equal to 365 days")
    private Integer sslExpiryDaysThreshold;


}
