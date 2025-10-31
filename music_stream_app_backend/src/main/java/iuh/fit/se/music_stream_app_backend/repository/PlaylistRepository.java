package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.Playlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends MongoRepository<Playlist, String> {
    List<Playlist> getPlaylistsByUserId(String userId);
}
