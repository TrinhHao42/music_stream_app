package iuh.fit.se.music_stream_app_backend.service;

import iuh.fit.se.music_stream_app_backend.models.Account;

public interface AccountService {
    Account getAccountByEmail(String username);
}
