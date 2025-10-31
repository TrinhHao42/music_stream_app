package iuh.fit.se.music_stream_app_backend.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String email;
    private String password;
    private String userName;
}
