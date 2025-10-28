package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "playlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Playlist {
    @Id
    private ObjectId playlistId;

    private String playlistName;

    @DBRef
    private User user;

    @DBRef
    private List<Song> songs;
}
