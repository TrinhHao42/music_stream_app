package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.dto.request.AddToLibraryRequest;
import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Playlist Controller", description = "APIs for managing playlists and songs in playlists")
public class PlaylistController {

    PlaylistService playlistService;

    @PostMapping
    @Operation(summary = "Create playlist", description = "Create a new playlist for user")
    public ResponseEntity<Playlist> createPlaylist(@RequestBody Playlist playlist) {
        Playlist created = playlistService.AddPlaylist(playlist);
        return ResponseEntity.created(URI.create("/playlists/" + created.getPlaylistId())).body(created);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get playlists by user", description = "Get all playlists created by a user")
    public List<Playlist> getPlaylistsByUser(@PathVariable String userId) {
        return playlistService.getPlayListByUser(userId);
    }

    @GetMapping("/user/{userId}/playlist/{playlistId}")
    @Operation(summary = "Get playlist by user ID and playlist ID", description = "Get a specific playlist for a user")
    public ResponseEntity<Playlist> getPlaylistByUserIdAndPlaylistId(
            @PathVariable String userId,
            @PathVariable String playlistId) {
        Playlist playlist = playlistService.getPlaylistByUserIdAndPlaylistId(userId, playlistId);
        return ResponseEntity.ok(playlist);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update playlist", description = "Update playlist information")
    public ResponseEntity<Playlist> updatePlaylist(@PathVariable String id, @RequestBody Playlist playlist) {
        playlist.setPlaylistId(id);
        Playlist updated = playlistService.UpdatePlaylist(playlist);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete playlist", description = "Delete a playlist")
    public ResponseEntity<Void> deletePlaylist(@PathVariable String id) {
        playlistService.DropPlaylist(id);
        return ResponseEntity.noContent().build();
    }

    // ============= SONG MANAGEMENT IN PLAYLIST =============

    @PostMapping("/{playlistId}/songs")
    @Operation(summary = "Add song to playlist", description = "Add a song to an existing playlist")
    public ResponseEntity<Playlist> addSongToPlaylist(
            @PathVariable String playlistId,
            @RequestBody AddToLibraryRequest request) {
        Playlist playlist = playlistService.addSongToPlaylist(playlistId, request.getItemId());
        return ResponseEntity.ok(playlist);
    }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    @Operation(summary = "Remove song from playlist", description = "Remove a song from a playlist")
    public ResponseEntity<Playlist> removeSongFromPlaylist(
            @PathVariable String playlistId,
            @PathVariable String songId) {
        Playlist playlist = playlistService.removeSongFromPlaylist(playlistId, songId);
        return ResponseEntity.ok(playlist);
    }

    @GetMapping("/{playlistId}/songs")
    @Operation(summary = "Get songs in playlist", description = "Get all songs in a playlist")
    public ResponseEntity<Playlist> getSongsInPlaylist(@PathVariable String playlistId) {
        Playlist playlist = playlistService.getSongsInPlaylist(playlistId);
        return ResponseEntity.ok(playlist);
    }
}
