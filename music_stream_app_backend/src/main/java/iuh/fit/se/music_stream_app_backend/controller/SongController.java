package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Song;
import iuh.fit.se.music_stream_app_backend.service.SongService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/search")
    public Page<Song> getSongsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songService.getSongsByName(name, pageable);
    }

    @PostMapping("/artist")
    public Page<Song> getSongsByArtist(
            @RequestBody List<String> artistNames,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return songService.getSongsByArtist(artistNames, pageable);
    }

    @GetMapping("/album/{albumName}")
    public List<Song> getSongsByAlbum(@PathVariable String albumName) {
        return songService.getSongsByAlbumName(albumName);
    }

    @PostMapping
    public Song addSong(@RequestBody Song song) {
        return songService.AddSong(song);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteSong(@PathVariable String id) {
        boolean deleted = songService.deleteById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
