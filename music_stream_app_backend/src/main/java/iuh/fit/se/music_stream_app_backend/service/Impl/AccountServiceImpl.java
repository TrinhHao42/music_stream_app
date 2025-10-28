package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Account;
import iuh.fit.se.music_stream_app_backend.repository.AccountRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AccountServiceImpl implements iuh.fit.se.music_stream_app_backend.service.AccountService {
    AccountRepository accountRepository;

    @Override
    public Account getAccountByEmail(String username) {
        return accountRepository.getAccountByEmail(username);
    }
}
