package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String userId;

    private String userName;
    private boolean gender;
    private LocalDate birthday;

    @DBRef
    private Account accounts;

    @DBRef
    private List<Playlist> playlists;

    @DBRef
    private List<Artist> followList;

    @DBRef
    private List<Song> likeList;

    @DBRef
    private List<Album> favouriteAlbums;
}
