package iuh.fit.se.music_stream_app_backend;

import iuh.fit.se.music_stream_app_backend.models.*;
import iuh.fit.se.music_stream_app_backend.repository.AccountRepository;
import iuh.fit.se.music_stream_app_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.awt.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@SpringBootApplication
public class TestInsert {
    public static void main(String[] args) {
        SpringApplication.run(TestInsert.class, args);
    }

    @Bean
    CommandLineRunner run(AccountRepository accountRepository) {
        return args -> {
            // Tạo danh sách 10 account mẫu
            List<Account> accounts = new ArrayList<>();

            for (int i = 1; i <= 10; i++) {
                Account acc = Account.builder()
                        .accountId("acc" + i)
                        .email("user" + i + "@example.com")
                        .password("123456")
                        .type(i % 2 == 0 ? "PREMIUM" : "STANDARD")
                        .build();
                accounts.add(acc);
            }

            accountRepository.saveAll(accounts);
            System.out.println("✅ Đã thêm " + accounts.size() + " accounts vào MongoDB");
        };
    }


}
