package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Album;
import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.service.AlbumService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return albumService.AddAlbum(album);
    }
}
