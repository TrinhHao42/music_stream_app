package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.Album;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends MongoRepository<Album, String> {
    @Query("{'artists': {$in: ?0}}")
    List<Album> getAlbumsByArtistIn(List<String> artistNames);

    List<Album> findByAlbumNameRegex(String regex);
}
