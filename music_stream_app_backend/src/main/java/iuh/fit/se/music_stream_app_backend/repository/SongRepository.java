package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends MongoRepository<Song, String> {
    @Query(value = "{'album.albumName': {$regex: ?0, $options: 'i'}}")
    List<Song> findByAlbumNameRegex(String regex);

    @Query("{'artist': {$in: ?0}}")
    Page<Song> getSongsByArtistIn(List<String> artistNames, Pageable pageable);

    @Query(value = "{'title': {$regex: ?0, $options: 'i'}}")
    Page<Song> findByTitleRegex(String regex, Pageable pageable);
}
