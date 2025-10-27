package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.models.Playlist;
import iuh.fit.se.music_stream_app_backend.models.User;
import iuh.fit.se.music_stream_app_backend.service.PlaylistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlaylistController {

    PlaylistService playlistService;

    @PostMapping
    public Playlist createPlaylist(Playlist playlist) {
        return playlistService.AddPlaylist(playlist);
    }

    @GetMapping("/user")
    public List<Playlist> getPlaylistsByUser(User user) {
        return playlistService.getPlayListByUser(user);
    }

    @PostMapping("/update")
    public Playlist updatePlaylist(Playlist playlist) {
        return playlistService.UpdatePlaylist(playlist);
    }

    @DeleteMapping("/delete")
    public void deletePlaylist(String playlistId) {
        playlistService.DropPlaylist(playlistId);
    }
}
