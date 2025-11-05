package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Account;
import java.util.List;
import java.util.Optional;

public interface AccountService {
    Account getAccountByEmail(String username);

    List<Account> findAll();

    Optional<Account> findById(String id);

    Account create(Account account);

    Optional<Account> update(String id, Account account);

    void deleteById(String id);

    Account upgradeToPremium(String userId);
}
