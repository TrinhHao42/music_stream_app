package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Playlist;

import java.util.List;

public interface PlaylistService {
    Playlist AddPlaylist(Playlist playlist);

    List<Playlist> getPlayListByUser(String userId);

    Playlist UpdatePlaylist(Playlist playlist);

    void DropPlaylist(String playlistId);
}
