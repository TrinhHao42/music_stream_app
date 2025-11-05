package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.dto.request.GenerateDownloadTokenRequest;
import iuh.fit.se.music_stream_app_backend.dto.response.DownloadTokenResponse;
import iuh.fit.se.music_stream_app_backend.service.DownloadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/download")
@RequiredArgsConstructor
@Tag(name = "Download Controller", description = "APIs for PREMIUM users to download songs securely")
public class DownloadController {

    private final DownloadService downloadService;

    @PostMapping("/token")
    @Operation(
        summary = "Generate download token",
        description = "Generate a one-time download token for PREMIUM users. Token expires in 15 minutes."
    )
    public ResponseEntity<DownloadTokenResponse> generateDownloadToken(
            @RequestBody GenerateDownloadTokenRequest request) {

        // Get current user ID from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // This should be the userId from JWT

        DownloadTokenResponse response = downloadService.generateDownloadToken(userId, request.getSongId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}")
    @Operation(
        summary = "Download song file",
        description = "Download song using a valid one-time token. Token can only be used once and expires in 15 minutes."
    )
    public ResponseEntity<Resource> downloadFile(@PathVariable String token) throws IOException {

        // Get current user ID from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Resource resource = downloadService.downloadFile(token, userId);

        // Get filename from resource
        String filename = resource.getFilename();
        if (filename == null) {
            filename = "song_" + System.currentTimeMillis() + ".mp3";
        }

        // Encode filename for Content-Disposition header
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encodedFilename)
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }

    @GetMapping("/stream/{token}")
    @Operation(
        summary = "Stream song file",
        description = "Stream song using a valid token for preview. Token can only be used once."
    )
    public ResponseEntity<Resource> streamFile(@PathVariable String token) throws IOException {

        // Get current user ID from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Resource resource = downloadService.downloadFile(token, userId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(resource);
    }
}

