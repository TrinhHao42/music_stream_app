package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.service.AlbumService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/albums")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AlbumController {
    AlbumService albumService;

    @GetMapping
    public List<Album> getAllAlbums() {
        return albumService.findAllAlbums();
    }

    @GetMapping("/{id}")
    public Album getAlbumById(@PathVariable String id) {
        return albumService.findAlbumById(id);
    }

    @PostMapping("/artist")
    public List<Album> getAlbumsByArtist(@RequestBody List<Artist> artists) {
        return albumService.getAlbumsByArtist(artists);
    }

    @PostMapping
    public Album addAlbum(@RequestBody Album album) {
        return albumService.addAlbum(album);
    }

    @GetMapping("/search")
    public List<Album> findByAlbumName(@RequestParam String name) {
        return albumService.findAlbumByName(name);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Album> update(@PathVariable String id, @RequestBody Album request) {
        Optional<Album> updated = albumService.update(id, request);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = albumService.deleteById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();

        }
    }
}
