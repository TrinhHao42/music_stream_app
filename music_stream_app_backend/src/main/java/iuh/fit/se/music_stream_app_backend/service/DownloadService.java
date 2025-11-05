package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.dto.response.DownloadTokenResponse;
import org.springframework.core.io.Resource;

public interface DownloadService {
    DownloadTokenResponse generateDownloadToken(String userId, String songId);

    Resource downloadFile(String token, String userId);

    void cleanupExpiredTokens();
}

