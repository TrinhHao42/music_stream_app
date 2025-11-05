package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Playlist;

import java.util.List;

public interface PlaylistService {
    Playlist AddPlaylist(Playlist playlist);

    List<Playlist> getPlayListByUser(String userId);

    Playlist getPlaylistByUserIdAndPlaylistId(String userId, String playlistId);

    Playlist UpdatePlaylist(Playlist playlist);

    void DropPlaylist(String playlistId);

    // Song management in playlist
    Playlist addSongToPlaylist(String playlistId, String songId);

    Playlist removeSongFromPlaylist(String playlistId, String songId);

    Playlist getSongsInPlaylist(String playlistId);
}
