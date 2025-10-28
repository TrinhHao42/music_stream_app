package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.models.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends MongoRepository<Song, String> {
    List<Song> getSongByAlbum(Album album);

    Page<Song> getSongsByArtists(List<Artist> artists, Pageable pageable);

    Page<Song> getSongsByTitleContains(String title, Pageable pageable);
}
