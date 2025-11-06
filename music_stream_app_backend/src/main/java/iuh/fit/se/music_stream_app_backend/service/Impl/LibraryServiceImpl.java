package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.dto.response.LibraryResponse;
import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.models.*;
import iuh.fit.se.music_stream_app_backend.repository.*;
import iuh.fit.se.music_stream_app_backend.service.LibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryServiceImpl implements LibraryService {

    private final LibraryRepository libraryRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final PlaylistRepository playlistRepository;
    private final ArtistRepository artistRepository;

    @Override
    public Library createLibrary(String userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return libraryRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Library newLibrary = Library.builder()
                            .userId(userId)
                            .favouriteSongs(new ArrayList<>())
                            .favouriteAlbums(new ArrayList<>())
                            .favouritePlaylists(new ArrayList<>())
                            .favouriteArtists(new ArrayList<>())
                            .build();
                    return libraryRepository.save(newLibrary);
                });
    }

    @Override
    public LibraryResponse getLibraryByUserId(String userId) {
        Library library = createLibrary(userId);

        // Test direct query
        if (!library.getFavouritePlaylists().isEmpty()) {
            String testPlaylistId = library.getFavouritePlaylists().get(0);

            // Try to find by ID directly
            var foundPlaylist = playlistRepository.findById(testPlaylistId);

            // Try to count all playlists
            long totalPlaylists = playlistRepository.count();

            // Try to find all playlists
            List<Playlist> allPlaylists = playlistRepository.findAll();
        }

        // Fetch actual objects
        List<Song> songs = library.getFavouriteSongs().stream()
                .map(songId -> songRepository.findById(songId).orElse(null))
                .filter(song -> song != null)
                .collect(Collectors.toList());

        List<Album> albums = library.getFavouriteAlbums().stream()
                .map(albumId -> albumRepository.findById(albumId).orElse(null))
                .filter(album -> album != null)
                .collect(Collectors.toList());

        List<Playlist> playlists = library.getFavouritePlaylists().stream()
                .map(playlistId -> {
                    Playlist playlist = playlistRepository.findById(playlistId).orElse(null);
                    return playlist;
                })
                .filter(playlist -> playlist != null)
                .collect(Collectors.toList());

        List<Artist> artists = library.getFavouriteArtists().stream()
                .map(artistId -> artistRepository.findById(artistId).orElse(null))
                .filter(artist -> artist != null)
                .collect(Collectors.toList());

        return LibraryResponse.builder()
                .libraryId(library.getLibraryId())
                .userId(library.getUserId())
                .favouriteSongs(songs)
                .favouriteAlbums(albums)
                .favouritePlaylists(playlists)
                .favouriteArtists(artists)
                .build();
    }

    @Override
    @Transactional
    public Library addSongToLibrary(String userId, String songId) {
        // Verify song exists
        songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", songId));

        Library library = createLibrary(userId);

        if (!library.getFavouriteSongs().contains(songId)) {
            library.getFavouriteSongs().add(songId);
            return libraryRepository.save(library);
        }

        return library;
    }

    @Override
    @Transactional
    public Library removeSongFromLibrary(String userId, String songId) {
        Library library = createLibrary(userId);
        library.getFavouriteSongs().remove(songId);
        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library addAlbumToLibrary(String userId, String albumId) {
        // Verify album exists
        albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album", "id", albumId));

        Library library = createLibrary(userId);

        if (!library.getFavouriteAlbums().contains(albumId)) {
            library.getFavouriteAlbums().add(albumId);
            return libraryRepository.save(library);
        }

        return library;
    }

    @Override
    @Transactional
    public Library removeAlbumFromLibrary(String userId, String albumId) {
        Library library = createLibrary(userId);
        library.getFavouriteAlbums().remove(albumId);
        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library addPlaylistToLibrary(String userId, String playlistId) {
        // Skip verification since playlist was just created
        // The playlist exists but may not be visible in the same transaction
        Library library = createLibrary(userId);

        if (!library.getFavouritePlaylists().contains(playlistId)) {
            library.getFavouritePlaylists().add(playlistId);
            return libraryRepository.save(library);
        }

        return library;
    }

    @Override
    @Transactional
    public Library removePlaylistFromLibrary(String userId, String playlistId) {
        Library library = createLibrary(userId);
        library.getFavouritePlaylists().remove(playlistId);

        // Xóa playlist khỏi database
        playlistRepository.deleteById(playlistId);
        log.info("Deleted playlist {} from database when removing from library", playlistId);

        return libraryRepository.save(library);
    }

    @Override
    @Transactional
    public Library addArtistToLibrary(String userId, String artistId) {
        // Verify artist exists
        artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist", "id", artistId));

        Library library = createLibrary(userId);

        if (!library.getFavouriteArtists().contains(artistId)) {
            library.getFavouriteArtists().add(artistId);
            return libraryRepository.save(library);
        }

        return library;
    }

    @Override
    @Transactional
    public Library removeArtistFromLibrary(String userId, String artistId) {
        Library library = createLibrary(userId);
        library.getFavouriteArtists().remove(artistId);
        return libraryRepository.save(library);
    }
}
