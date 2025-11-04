package iuh.fit.se.music_stream_app_backend.dto.response;

import iuh.fit.se.music_stream_app_backend.models.enums.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpgradeResponse {
    private String accountId;
    private String userId;
    private String email;
    private Type type;
    private String message;
}

