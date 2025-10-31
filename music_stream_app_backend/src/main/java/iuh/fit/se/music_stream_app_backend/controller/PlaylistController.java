package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.service.PlaylistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.net.URI;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlaylistController {

    PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(@RequestBody Playlist playlist) {
        Playlist created = playlistService.AddPlaylist(playlist);
        return ResponseEntity.created(URI.create("/playlists/" + created.getPlaylistId())).body(created);
    }

    @GetMapping("/user/{userId}")
    public List<Playlist> getPlaylistsByUser(@PathVariable String userId) {
        return playlistService.getPlayListByUser(userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Playlist> updatePlaylist(@PathVariable String id, @RequestBody Playlist playlist) {
        playlist.setPlaylistId(id);
        Playlist updated = playlistService.UpdatePlaylist(playlist);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable String id) {
        playlistService.DropPlaylist(id);
        return ResponseEntity.noContent().build();
    }
}
