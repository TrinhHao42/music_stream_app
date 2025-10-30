package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Account;
import iuh.fit.se.music_stream_app_backend.repository.AccountRepository;
import java.util.List;
import java.util.Optional;
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

	@Override
	public List<Account> findAll() {
		return accountRepository.findAll();
	}

	@Override
	public Optional<Account> findById(String id) {
		return accountRepository.findById(id);
	}

	@Override
	public Account create(Account account) {
		return accountRepository.save(account);
	}

	@Override
	public Optional<Account> update(String id, Account account) {
		return accountRepository.findById(id).map(existing -> {
			existing.setAvatarUrl(account.getAvatarUrl());
			existing.setEmail(account.getEmail());
			existing.setPassword(account.getPassword());
			existing.setType(account.getType());
			return accountRepository.save(existing);
		});
	}

	@Override
	public void deleteById(String id) {
		accountRepository.deleteById(id);
	}
}
