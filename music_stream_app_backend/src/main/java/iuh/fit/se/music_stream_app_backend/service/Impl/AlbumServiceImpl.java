package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.repository.AlbumRepository;
import iuh.fit.se.music_stream_app_backend.service.AlbumService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AlbumServiceImpl implements AlbumService {
    AlbumRepository albumRepository;

    @Override
    public Album addAlbum(Album album) {
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

    @Override
    public List<Album> findAlbumByName(String name) {
       return albumRepository.findByAlbumNameRegex(".*" + name + ".*");
    }

    @Override
    public Optional<Album> update (String id, Album album) {
        return albumRepository.findById(id).map(existing -> {
            existing.setAlbumName(album.getAlbumName());
            existing.setArtists(album.getArtists());
            existing.setImage(album.getImage());
            existing.setListens(album.getListens());
            existing.setFavourites(album.getFavourites());
            existing.setRelease(album.getRelease());
            return albumRepository.save(existing);
        });
    }

    @Override
    public boolean deleteById(String id) {
        if (albumRepository.existsById(id)) {
            albumRepository.deleteById(id);
            return true;
        }
        return false;
    }


}
