package com.puspo.uptime.modules.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final AuthenticationManager authenticationManager;

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new RuntimeException("Email already exists");
    }

    var user = User.builder()
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .build();

    userRepository.save(user);

    var jwtToken = jwtUtil.generateToken(user);

    return AuthResponse.builder()
        .token(jwtToken)
        .build();
  }

  public AuthResponse login(LoginRequest request) {

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()));

    var user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    var jwtToken = jwtUtil.generateToken(user);

    return AuthResponse.builder()
        .token(jwtToken)
        .build();
  }
}
