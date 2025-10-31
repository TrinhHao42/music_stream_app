package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.models.Song;
import iuh.fit.se.music_stream_app_backend.repository.SongRepository;
import iuh.fit.se.music_stream_app_backend.service.SongService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SongServiceImpl implements SongService {
    SongRepository songRepository;

    @Override
    public Song AddSong(Song song) {
        return songRepository.save(song);
    }

    @Override
    public Page<Song> findAllSongs(Pageable pageable) {
        return songRepository.findAll(pageable);
    }

    @Override
    public Song findSongById(String id) {
        return songRepository.findById(id).orElse(null);
    }

    @Override
    public List<Song> getSongsByAlbum(Album album) {
        return songRepository.getSongByAlbum(album);
    }

    @Override
    public Page<Song> getSongsByArtist(List<Artist> artists, Pageable pageable) {
        return songRepository.getSongsByArtists(artists, pageable);
    }

    @Override
    public Page<Song> getSongsByName(String name, Pageable pageable) {
        return songRepository.getSongsByTitleContains(name, pageable);
    }

    @Override
    public boolean deleteById(String id) {
        if (songRepository.existsById(id)) {
            songRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
