package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;

import java.util.List;

public interface AlbumService {
    Album AddAlbum(Album album);
    List<Album> findAllAlbums();
    Album findAlbumById(String id);
    List<Album> getAlbumsByArtist(List<Artist> artists);
}
