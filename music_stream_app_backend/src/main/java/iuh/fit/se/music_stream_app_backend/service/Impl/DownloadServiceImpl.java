package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.dto.response.DownloadTokenResponse;
import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.exception.UnauthorizedException;
import iuh.fit.se.music_stream_app_backend.models.Account;
import iuh.fit.se.music_stream_app_backend.models.DownloadToken;
import iuh.fit.se.music_stream_app_backend.models.Song;
import iuh.fit.se.music_stream_app_backend.models.enums.Type;
import iuh.fit.se.music_stream_app_backend.repository.AccountRepository;
import iuh.fit.se.music_stream_app_backend.repository.DownloadTokenRepository;
import iuh.fit.se.music_stream_app_backend.repository.SongRepository;
import iuh.fit.se.music_stream_app_backend.service.DownloadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DownloadServiceImpl implements DownloadService {

    private final DownloadTokenRepository downloadTokenRepository;
    private final AccountRepository accountRepository;
    private final SongRepository songRepository;

    private static final int TOKEN_EXPIRY_MINUTES = 15; // Token có hiệu lực 15 phút

    @Override
    @Transactional
    public DownloadTokenResponse generateDownloadToken(String userId, String songId) {
        // 1. Verify user exists and has PREMIUM account
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "userId", userId));

        if (account.getType() != Type.PREMIUM) {
            throw new UnauthorizedException("Only PREMIUM users can download songs. Please upgrade your account.");
        }

        // 2. Verify song exists
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", songId));

        if (song.getAudioUrl() == null || song.getAudioUrl().isEmpty()) {
            throw new IllegalStateException("Song audio file is not available");
        }

        // 3. Generate one-time token
        String token = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(TOKEN_EXPIRY_MINUTES);

        DownloadToken downloadToken = DownloadToken.builder()
                .token(token)
                .userId(userId)
                .songId(songId)
                .createdAt(now)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        downloadTokenRepository.save(downloadToken);

        log.info("Generated download token for user {} for song {}", userId, songId);

        // 4. Calculate file size (estimate from URL or set default)
        long estimatedSize = 5 * 1024 * 1024; // Default 5MB

        // 5. Build download URL
        String downloadUrl = "/api/download/" + token;

        // 6. Format artist names
        String artistNames = song.getArtist() != null ? String.join(", ", song.getArtist()) : "Unknown Artist";

        return DownloadTokenResponse.builder()
                .token(token)
                .downloadUrl(downloadUrl)
                .expiresAt(expiresAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .songTitle(song.getTitle())
                .artist(artistNames)
                .fileSizeBytes(estimatedSize)
                .build();
    }

    @Override
    @Transactional
    public Resource downloadFile(String token, String userId) {
        // 1. Validate token
        LocalDateTime now = LocalDateTime.now();
        DownloadToken downloadToken = downloadTokenRepository
                .findByTokenAndUsedFalseAndExpiresAtAfter(token, now)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired download token"));

        // 2. Verify token belongs to requesting user
        if (!downloadToken.getUserId().equals(userId)) {
            log.warn("User {} attempted to use token belonging to user {}", userId, downloadToken.getUserId());
            throw new UnauthorizedException("This download token does not belong to you");
        }

        // 3. Verify user still has PREMIUM access
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "userId", userId));

        if (account.getType() != Type.PREMIUM) {
            throw new UnauthorizedException("PREMIUM subscription required to download songs");
        }

        // 4. Get song details
        Song song = songRepository.findById(downloadToken.getSongId())
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", downloadToken.getSongId()));

        // 5. Mark token as used
        downloadToken.setUsed(true);
        downloadToken.setUsedAt(now);
        downloadTokenRepository.save(downloadToken);

        log.info("User {} downloading song {} using token {}", userId, song.getTitle(), token);

        // 6. Return file resource from URL
        try {
            URL url = new URL(song.getAudioUrl());
            Resource resource = new UrlResource(url);

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File", "url", song.getAudioUrl());
            }
        } catch (MalformedURLException e) {
            log.error("Invalid audio URL for song {}: {}", song.getSongId(), song.getAudioUrl(), e);
            throw new IllegalStateException("Invalid audio URL");
        } catch (IOException e) {
            log.error("Error accessing audio file for song {}", song.getSongId(), e);
            throw new IllegalStateException("Error accessing audio file");
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        downloadTokenRepository.deleteByExpiresAtBefore(now);
        log.info("Cleaned up expired download tokens");
    }
}
