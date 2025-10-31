package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.dto.request.LoginRequest;
import iuh.fit.se.music_stream_app_backend.dto.request.RefreshTokenRequest;
import iuh.fit.se.music_stream_app_backend.dto.request.RegisterRequest;
import iuh.fit.se.music_stream_app_backend.dto.response.AuthResponse;
import iuh.fit.se.music_stream_app_backend.models.User;
import iuh.fit.se.music_stream_app_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}
