package com.puspo.uptime.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private String code;
    private String message;
    private List<Detail> details;
    private String traceId;
    private LocalDateTime timestamp;

    @Getter
    @Builder
    public static class Detail {
        private String field;
        private String message;
    }
}
