package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "playlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Playlist {
    @Id
    private String playlistId;

    @Field("playlist_name")
    private String playlistName;

    @Field("user_id")
    private String userId;

    @Field("songs")
    private List<String> songs;
}
