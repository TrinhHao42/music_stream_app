package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.dto.request.LoginRequest;
import iuh.fit.se.music_stream_app_backend.dto.request.RegisterRequest;
import iuh.fit.se.music_stream_app_backend.dto.response.AuthResponse;
import iuh.fit.se.music_stream_app_backend.models.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    User getCurrentUser(String email);
}

