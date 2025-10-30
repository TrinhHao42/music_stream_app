package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.repository.ArtistRepository;
import iuh.fit.se.music_stream_app_backend.service.ArtistService;
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
public class ArtistServiceImpl implements ArtistService {
    ArtistRepository artistRepository;

    @Override
    public Artist AddArtist(Artist artist) {
        return artistRepository.save(artist);
    }

    @Override
    public Artist findArtistById(String id) {
        return artistRepository.findById(id).orElse(null);
    }

    @Override
    public Page<Artist> findAllArtists(Pageable pageable) {
        return artistRepository.findAll(pageable);
    }

    @Override
    public Page<Artist> findArtistByName(String name, Pageable pageable) {
        return artistRepository.getArtistsByArtistNameContains(name, pageable);
    }
}
