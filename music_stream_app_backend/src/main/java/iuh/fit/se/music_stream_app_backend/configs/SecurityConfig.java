package iuh.fit.se.music_stream_app_backend.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.LogoutConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // chỉ người dùng PREMIUM được truy cập endpoint /premium/**
                        .requestMatchers("/premium/**").hasRole("PREMIUM")

                        // cả STANDARD và PREMIUM đều được truy cập endpoint /user/**
                        .requestMatchers("/user/**").hasAnyRole("STANDARD", "PREMIUM")

                        // các request khác được phép tự do (public API)
                        .anyRequest().permitAll()
                )
                .logout(LogoutConfigurer::permitAll)
                .csrf(csrf -> csrf.disable()); // tạm tắt CSRF nếu dùng API (REST)

        return http.build();
    }
}
