package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArtistService {
    Artist AddArtist(Artist artist);

    Artist findArtistById(String id);

    Page<Artist> findAllArtists(Pageable pageable);

    Page<Artist> findArtistByName(String name, Pageable pageable);
}
