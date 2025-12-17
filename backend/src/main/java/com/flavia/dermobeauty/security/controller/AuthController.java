package com.flavia.dermobeauty.security.controller;

import com.flavia.dermobeauty.security.dto.LoginRequest;
import com.flavia.dermobeauty.security.dto.LoginResponse;
import com.flavia.dermobeauty.security.jwt.JwtTokenProvider;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication controller for admin login.
 * Validates hardcoded credentials and returns JWT token.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPasswordHash;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        if (!adminUsername.equals(request.getUsername())) {
            log.warn("Login failed: Invalid username");
            return ResponseEntity.status(401)
                    .body(ApiResponse.success(null, "Invalid credentials"));
        }

        if (!passwordEncoder.matches(request.getPassword(), adminPasswordHash)) {
            log.warn("Login failed: Invalid password");
            return ResponseEntity.status(401)
                    .body(ApiResponse.success(null, "Invalid credentials"));
        }

        String token = jwtTokenProvider.generateToken(adminUsername);
        LoginResponse response = new LoginResponse(token, adminUsername, "ADMIN");

        log.info("Login successful for user: {}", adminUsername);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
