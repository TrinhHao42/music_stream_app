package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

}
