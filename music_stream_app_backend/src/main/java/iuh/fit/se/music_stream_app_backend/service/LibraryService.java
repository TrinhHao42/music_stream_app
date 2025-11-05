package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.dto.response.LibraryResponse;
import iuh.fit.se.music_stream_app_backend.models.Library;

public interface LibraryService {
    Library getOrCreateLibrary(String userId);
    LibraryResponse getLibraryByUserId(String userId);

    // Song operations
    Library addSongToLibrary(String userId, String songId);
    Library removeSongFromLibrary(String userId, String songId);

    // Album operations
    Library addAlbumToLibrary(String userId, String albumId);
    Library removeAlbumFromLibrary(String userId, String albumId);

    // Playlist operations
    Library addPlaylistToLibrary(String userId, String playlistId);
    Library removePlaylistFromLibrary(String userId, String playlistId);

    // Artist operations
    Library addArtistToLibrary(String userId, String artistId);
    Library removeArtistFromLibrary(String userId, String artistId);
}

