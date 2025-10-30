package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.models.User;
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
    public List<Playlist> getPlayListByUser(User user) {
        return playlistRepository.getPlaylistsByUser(user);
    }

    @Override
    public Playlist UpdatePlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
    }

    @Override
    public void DropPlaylist(String playlistId) {
        playlistRepository.deleteById(playlistId);
    }
}
