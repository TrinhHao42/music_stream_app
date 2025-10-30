package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.models.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SongService {
    Song AddSong(Song song);
    Page<Song> findAllSongs(Pageable pageable);
    Song findSongById(String id);
    List<Song> getSongsByAlbum(Album album);
    Page<Song> getSongsByArtist(List<Artist> artists, Pageable pageable);
    Page<Song> getSongsByName(String name, Pageable pageable);
}
