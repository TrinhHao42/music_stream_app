package iuh.fit.se.music_stream_app_backend.repository;

import iuh.fit.se.music_stream_app_backend.models.Account;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, String> {
    Account findByEmail(String email);

    Account getAccountByEmail(String email);

    Optional<Account> findByUserId(String userId);
}
