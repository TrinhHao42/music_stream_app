package iuh.fit.se.music_stream_app_backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "download_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadToken {
    @Id
    private String tokenId;

    @Field("token")
    private String token;

    @Field("user_id")
    private String userId;

    @Field("song_id")
    private String songId;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("expires_at")
    private LocalDateTime expiresAt;

    @Field("used")
    @Builder.Default
    private boolean used = false;

    @Field("used_at")
    private LocalDateTime usedAt;
}

