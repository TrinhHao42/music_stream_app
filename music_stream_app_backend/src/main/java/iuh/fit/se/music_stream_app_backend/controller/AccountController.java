package iuh.fit.se.music_stream_app_backend.controller;

import iuh.fit.se.music_stream_app_backend.service.AccountService;
import iuh.fit.se.music_stream_app_backend.models.Account;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AccountController {
    AccountService accountService;

	@GetMapping
	public ResponseEntity<List<Account>> getAll() {
		return ResponseEntity.ok(accountService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Account> getById(@PathVariable String id) {
		Optional<Account> found = accountService.findById(id);
		return found.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping("/search")
	public ResponseEntity<Account> getByEmail(@RequestParam String email) {
		Account account = accountService.getAccountByEmail(email);
		if (account == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(account);
	}

	@PostMapping
	public ResponseEntity<Account> create(@RequestBody Account request) {
		Account created = accountService.create(request);
		return ResponseEntity.created(URI.create("/accounts/" + created.getAccountId())).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Account> update(@PathVariable String id, @RequestBody Account request) {
		Optional<Account> updated = accountService.update(id, request);
		return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		accountService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
