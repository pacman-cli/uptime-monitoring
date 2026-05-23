package com.puspo.uptime.common.exception;

import java.time.LocalDateTime;
import java.util.UUID;

import com.puspo.uptime.common.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
    return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
    return buildResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage());
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
    return buildResponse(HttpStatus.CONFLICT, "CONFLICT", ex.getMessage());
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiError> handleAuthenticationException(AuthenticationException ex) {
    return buildResponse(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", "Invalid email or password");
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException ex) {
    var details = ex.getBindingResult().getFieldErrors().stream()
        .map(error -> ErrorResponse.Detail.builder()
            .field(error.getField())
            .message(error.getDefaultMessage())
            .build())
        .toList();

    var response = ErrorResponse.builder()
        .code("VALIDATION_FAILED")
        .message("One or more fields are invalid")
        .details(details)
        .traceId(generateTraceId())
        .timestamp(LocalDateTime.now())
        .build();

    return new ResponseEntity<>(new ApiError(response), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleGenericException(Exception ex) {
    return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred");
  }

  private ResponseEntity<ApiError> buildResponse(HttpStatus status, String code, String message) {
    var response = ErrorResponse.builder()
        .code(code)
        .message(message)
        .traceId(generateTraceId())
        .timestamp(LocalDateTime.now())
        .build();
    return new ResponseEntity<>(new ApiError(response), status);
  }

  private String generateTraceId() {
    return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
  }

  public static class ApiError {
    private final ErrorResponse error;
    public ApiError(ErrorResponse error) { this.error = error; }
    public ErrorResponse getError() { return error; }
  }
}
