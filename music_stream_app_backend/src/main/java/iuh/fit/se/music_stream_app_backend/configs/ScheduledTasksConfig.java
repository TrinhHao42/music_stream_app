package iuh.fit.se.music_stream_app_backend.configs;

import iuh.fit.se.music_stream_app_backend.service.DownloadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasksConfig {

    private final DownloadService downloadService;

    // Chạy mỗi 30 phút để cleanup expired tokens
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void cleanupExpiredDownloadTokens() {
        downloadService.cleanupExpiredTokens();
    }
}

