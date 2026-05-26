package com.puspo.uptime.modules.auth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.puspo.uptime.modules.auth.entity.RefreshToken;
import com.puspo.uptime.modules.auth.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puspo.uptime.common.exception.ConflictException;
import com.puspo.uptime.common.exception.ResourceNotFoundException;
import com.puspo.uptime.config.JwtUtil;
import com.puspo.uptime.modules.auth.dto.AuthResponse;
import com.puspo.uptime.modules.auth.dto.LoginRequest;
import com.puspo.uptime.modules.auth.dto.RegisterRequest;
import com.puspo.uptime.modules.auth.entity.User;
import com.puspo.uptime.modules.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private int refreshExpirationDays;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already exists");
        }

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        var savedUser = userRepository.save(user);
        var accessToken = jwtUtil.generateToken(savedUser);
        var refreshToken = createRefreshToken(savedUser);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var accessToken = jwtUtil.generateToken(user);
        var refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        var storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (storedToken.isExpired() || storedToken.isRevoked()) {
            throw new ResourceNotFoundException("Refresh token expired or revoked");
        }

        var user = storedToken.getUser();
        var newAccessToken = jwtUtil.generateToken(user);
        var newRefreshToken = createRefreshToken(user);

        storedToken.revoke();
        refreshTokenRepository.save(storedToken);

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(RefreshToken::revoke);
    }

    @Scheduled(fixedDelay = 3600000) // every hour
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        refreshTokenRepository.deleteExpired(LocalDateTime.now());
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(refreshExpirationDays))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
