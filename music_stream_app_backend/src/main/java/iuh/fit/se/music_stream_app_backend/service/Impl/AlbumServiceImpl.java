package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.repository.AlbumRepository;
import iuh.fit.se.music_stream_app_backend.service.AlbumService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AlbumServiceImpl implements AlbumService {
    AlbumRepository albumRepository;

    @Override
    public Album AddAlbum(Album album) {
        return albumRepository.save(album);
    }

    @Override
    public List<Album> findAllAlbums() {
        return albumRepository.findAll();
    }

    @Override
    public Album findAlbumById(String id) {
        return albumRepository.findById(id).orElse(null);
    }

    @Override
    public List<Album> getAlbumsByArtist(List<Artist> artists) {
        return albumRepository.getAlbumsByArtists(artists);
    }
}
