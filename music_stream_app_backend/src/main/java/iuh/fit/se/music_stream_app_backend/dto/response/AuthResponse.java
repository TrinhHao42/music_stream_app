package iuh.fit.se.music_stream_app_backend.dto.response;

import iuh.fit.se.music_stream_app_backend.models.User;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private User user;
}

