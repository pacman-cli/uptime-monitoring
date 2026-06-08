package com.puspo.uptime.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.puspo.uptime.config.JwtUtil;
import com.puspo.uptime.modules.auth.dto.AuthResponse;
import com.puspo.uptime.modules.auth.dto.LoginRequest;
import com.puspo.uptime.modules.auth.dto.RegisterRequest;
import com.puspo.uptime.modules.auth.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final JwtUtil jwtUtil;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                HttpServletResponse response) {
    AuthResponse authResponse = authService.register(request);
    jwtUtil.setTokenCookie(response, authResponse.getToken());
    return ResponseEntity.ok(authResponse);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                             HttpServletResponse response) {
    AuthResponse authResponse = authService.login(request);
    jwtUtil.setTokenCookie(response, authResponse.getToken());
    return ResponseEntity.ok(authResponse);
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request,
                                               HttpServletResponse response) {
    AuthResponse authResponse = authService.refresh(request.getRefreshToken());
    jwtUtil.setTokenCookie(response, authResponse.getToken());
    return ResponseEntity.ok(authResponse);
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request,
                                      HttpServletResponse response) {
    authService.logout(request.getRefreshToken());
    jwtUtil.clearTokenCookie(response);
    return ResponseEntity.noContent().build();
  }

  @lombok.Data
  public static class RefreshRequest {
    @jakarta.validation.constraints.NotBlank(message = "Refresh token is required")
    private String refreshToken;
  }
}
