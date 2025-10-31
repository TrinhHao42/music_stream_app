package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.repository.PlaylistRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlaylistServiceImpl implements iuh.fit.se.music_stream_app_backend.service.PlaylistService {
    PlaylistRepository playlistRepository;

    @Override
    public Playlist AddPlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
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
}
