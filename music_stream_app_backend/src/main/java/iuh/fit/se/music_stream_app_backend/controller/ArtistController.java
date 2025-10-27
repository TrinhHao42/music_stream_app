package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.service.ArtistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/artists")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ArtistController {
    ArtistService artistService;

    @GetMapping
    public Page<Artist> getAllArtists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return artistService.findAllArtists(pageable);
    }

    @GetMapping
    public Artist getArtistById(@RequestParam String id) {
        return artistService.findArtistById(id);
    }

    @GetMapping
    public Page<Artist> getArtistsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return artistService.findArtistByName(name, pageable);
    }

    @PostMapping
    public Artist addArtist(@RequestBody Artist artist) {
        return artistService.AddArtist(artist);
    }
}
