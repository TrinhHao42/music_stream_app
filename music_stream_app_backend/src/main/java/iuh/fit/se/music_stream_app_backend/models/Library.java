package iuh.fit.se.music_stream_app_backend.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "libraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Library {
    @Id
    private String libraryId;

    @Field("user_id")
    private String userId;

    @Field("favourite_songs")
    @Builder.Default
    private List<String> favouriteSongs = new ArrayList<>();

    @Field("favourite_albums")
    @Builder.Default
    private List<String> favouriteAlbums = new ArrayList<>();

    @Field("favourite_playlists")
    @Builder.Default
    private List<String> favouritePlaylists = new ArrayList<>();

    @Field("favourite_artists")
    @Builder.Default
    private List<String> favouriteArtists = new ArrayList<>();
}
