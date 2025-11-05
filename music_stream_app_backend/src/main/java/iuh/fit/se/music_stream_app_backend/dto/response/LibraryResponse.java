package iuh.fit.se.music_stream_app_backend.dto.response;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.models.Song;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryResponse {
    private String libraryId;
    private String userId;
    private List<Song> favouriteSongs;
    private List<Album> favouriteAlbums;
    private List<Playlist> favouritePlaylists;
    private List<Artist> favouriteArtists;
}

