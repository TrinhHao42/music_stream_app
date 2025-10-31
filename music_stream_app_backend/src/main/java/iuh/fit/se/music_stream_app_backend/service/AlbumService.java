package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Album;

import java.util.List;
import java.util.Optional;

public interface AlbumService {
    Album addAlbum(Album album);
    List<Album> findAllAlbums();
    Album findAlbumById(String id);
    List<Album> getAlbumsByArtist(List<String> artistNames);
    List<Album> findAlbumByName(String name);
    Optional<Album> update (String id, Album album);
    boolean deleteById(String id);
}
