package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.models.Song;
import iuh.fit.se.music_stream_app_backend.service.SongService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/songs")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SongController {

    SongService songService;

    @GetMapping
    public Page<Song> getAllSongs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songService.findAllSongs(pageable);
    }

    @GetMapping("/{id}")
    public Song getSongById(@PathVariable String id) {
        return songService.findSongById(id);
    }

    @GetMapping("/{name}")
    public Page<Song> getSongsByName(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songService.getSongsByName(name, pageable);
    }

    @PostMapping("/artist")
    public Page<Song> getSongsByArtist(
            @RequestBody List<Artist> artists,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songService.getSongsByArtist(artists, pageable);
    }

    @PostMapping("/album")
    public List<Song> getSongsByAlbum(@RequestBody Album album) {
        return songService.getSongsByAlbum(album);
    }

    @PostMapping
    public Song addSong(@RequestBody Song song) {
        return songService.AddSong(song);
    }
}
