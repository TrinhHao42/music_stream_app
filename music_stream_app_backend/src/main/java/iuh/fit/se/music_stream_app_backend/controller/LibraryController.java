package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.dto.request.AddToLibraryRequest;
import iuh.fit.se.music_stream_app_backend.dto.response.LibraryResponse;
import iuh.fit.se.music_stream_app_backend.models.Library;
import iuh.fit.se.music_stream_app_backend.service.LibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/libraries")
@RequiredArgsConstructor
@Tag(name = "Library Controller", description = "APIs for managing user's library")
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user's library", description = "Get all favorite items in user's library")
    public ResponseEntity<LibraryResponse> getLibrary(@PathVariable String userId) {
        return ResponseEntity.ok(libraryService.getLibraryByUserId(userId));
    }

    // ============= SONG OPERATIONS =============

    @PostMapping("/{userId}/songs")
    @Operation(summary = "Add song to library", description = "Add a song to user's favorite songs")
    public ResponseEntity<Library> addSongToLibrary(
            @PathVariable String userId,
            @RequestBody AddToLibraryRequest request) {
        Library library = libraryService.addSongToLibrary(userId, request.getItemId());
        return ResponseEntity.ok(library);
    }

    @DeleteMapping("/{userId}/songs/{songId}")
    @Operation(summary = "Remove song from library", description = "Remove a song from user's favorite songs")
    public ResponseEntity<Library> removeSongFromLibrary(
            @PathVariable String userId,
            @PathVariable String songId) {
        Library library = libraryService.removeSongFromLibrary(userId, songId);
        return ResponseEntity.ok(library);
    }

    // ============= ALBUM OPERATIONS =============

    @PostMapping("/{userId}/albums")
    @Operation(summary = "Add album to library", description = "Add an album to user's favorite albums")
    public ResponseEntity<Library> addAlbumToLibrary(
            @PathVariable String userId,
            @RequestBody AddToLibraryRequest request) {
        Library library = libraryService.addAlbumToLibrary(userId, request.getItemId());
        return ResponseEntity.ok(library);
    }

    @DeleteMapping("/{userId}/albums/{albumId}")
    @Operation(summary = "Remove album from library", description = "Remove an album from user's favorite albums")
    public ResponseEntity<Library> removeAlbumFromLibrary(
            @PathVariable String userId,
            @PathVariable String albumId) {
        Library library = libraryService.removeAlbumFromLibrary(userId, albumId);
        return ResponseEntity.ok(library);
    }

    // ============= PLAYLIST OPERATIONS =============

    @PostMapping("/{userId}/playlists")
    @Operation(summary = "Add playlist to library", description = "Add a playlist to user's favorite playlists")
    public ResponseEntity<Library> addPlaylistToLibrary(
            @PathVariable String userId,
            @RequestBody AddToLibraryRequest request) {
        Library library = libraryService.addPlaylistToLibrary(userId, request.getItemId());
        return ResponseEntity.ok(library);
    }

    @DeleteMapping("/{userId}/playlists/{playlistId}")
    @Operation(summary = "Remove playlist from library", description = "Remove a playlist from user's favorite playlists")
    public ResponseEntity<Library> removePlaylistFromLibrary(
            @PathVariable String userId,
            @PathVariable String playlistId) {
        Library library = libraryService.removePlaylistFromLibrary(userId, playlistId);
        return ResponseEntity.ok(library);
    }

    // ============= ARTIST OPERATIONS =============

    @PostMapping("/{userId}/artists")
    @Operation(summary = "Add artist to library", description = "Add an artist to user's favorite artists")
    public ResponseEntity<Library> addArtistToLibrary(
            @PathVariable String userId,
            @RequestBody AddToLibraryRequest request) {
        Library library = libraryService.addArtistToLibrary(userId, request.getItemId());
        return ResponseEntity.ok(library);
    }

    @DeleteMapping("/{userId}/artists/{artistId}")
    @Operation(summary = "Remove artist from library", description = "Remove an artist from user's favorite artists")
    public ResponseEntity<Library> removeArtistFromLibrary(
            @PathVariable String userId,
            @PathVariable String artistId) {
        Library library = libraryService.removeArtistFromLibrary(userId, artistId);
        return ResponseEntity.ok(library);
    }
}

