package iuh.fit.se.music_stream_app_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadTokenResponse {
    private String token;
    private String downloadUrl;
    private String expiresAt;
    private String songTitle;
    private String artist;
    private long fileSizeBytes;
}

