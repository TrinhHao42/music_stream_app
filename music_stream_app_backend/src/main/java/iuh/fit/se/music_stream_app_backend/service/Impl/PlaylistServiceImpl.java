package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.repository.PlaylistRepository;
import iuh.fit.se.music_stream_app_backend.repository.SongRepository;
import iuh.fit.se.music_stream_app_backend.service.LibraryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class PlaylistServiceImpl implements iuh.fit.se.music_stream_app_backend.service.PlaylistService {
    PlaylistRepository playlistRepository;
    SongRepository songRepository;
    LibraryService libraryService;

    @Override
    @Transactional
    public Playlist AddPlaylist(Playlist playlist) {
        log.info("Creating playlist for user: {}", playlist.getUserId());

        // Save playlist first
        Playlist savedPlaylist = playlistRepository.save(playlist);
        log.info("Playlist saved with ID: {}", savedPlaylist.getPlaylistId());

        // Automatically add to user's library after playlist is saved
        if (savedPlaylist.getUserId() != null && savedPlaylist.getPlaylistId() != null) {
            log.info("Adding playlist {} to library for user {}",
                savedPlaylist.getPlaylistId(), savedPlaylist.getUserId());
            try {
                libraryService.addPlaylistToLibrary(savedPlaylist.getUserId(), savedPlaylist.getPlaylistId());
                log.info("Successfully added playlist to library");
            } catch (Exception e) {
                log.error("Failed to add playlist to library: {}", e.getMessage(), e);
                // Don't fail the whole operation if library update fails
            }
        }

        return savedPlaylist;
    }

    @Override
    public List<Playlist> getPlayListByUser(String userId) {
        return playlistRepository.getPlaylistsByUserId(userId);
    }

    @Override
    public Playlist UpdatePlaylist(Playlist playlist) {
        if (!playlistRepository.existsById(playlist.getPlaylistId())) {
            throw new ResourceNotFoundException("Playlist", "id", playlist.getPlaylistId());
        }
        return playlistRepository.save(playlist);
    }

    @Override
    public void DropPlaylist(String playlistId) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist", "id", playlistId);
        }
        playlistRepository.deleteById(playlistId);
    }

    @Override
    @Transactional
    public Playlist addSongToPlaylist(String playlistId, String songId) {
        // Verify song exists
        if (!songRepository.existsById(songId)) {
            throw new ResourceNotFoundException("Song", "id", songId);
        }

        // Get playlist
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist", "id", playlistId));

        // Initialize songs list if null
        if (playlist.getSongs() == null) {
            playlist.setSongs(new ArrayList<>());
        }

        // Add song if not already in playlist
        if (!playlist.getSongs().contains(songId)) {
            playlist.getSongs().add(songId);
            return playlistRepository.save(playlist);
        }

        return playlist;
    }

    @Override
    @Transactional
    public Playlist removeSongFromPlaylist(String playlistId, String songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist", "id", playlistId));

        if (playlist.getSongs() != null) {
            playlist.getSongs().remove(songId);
            return playlistRepository.save(playlist);
        }

        return playlist;
    }

    @Override
    public Playlist getSongsInPlaylist(String playlistId) {
        return playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist", "id", playlistId));
    }

    @Override
    public Playlist getPlaylistByUserIdAndPlaylistId(String userId, String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist", "id", playlistId));

        // Verify that the playlist belongs to the user
        if (!playlist.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Playlist", "id", playlistId + " for user " + userId);
        }

        return playlist;
    }
}

