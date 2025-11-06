package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(String id);
    User create(User user);
    Optional<User> update(String id, User user);
    void deleteById(String id);
    boolean renameUsername(String id, String newUsername);
}
