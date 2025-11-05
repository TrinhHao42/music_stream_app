package iuh.fit.se.music_stream_app_backend.configs;

import iuh.fit.se.music_stream_app_backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final SecurityEndpoints securityEndpoints;


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Cho phép tất cả origin — hợp lệ khi dùng allowedOriginPatterns
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // ✅ Cho phép các HTTP methods thông dụng
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // ✅ Cho phép tất cả headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // ✅ Cho phép gửi cookies, token, header Authorization,...
        configuration.setAllowCredentials(true);

        // ✅ Cho phép client thấy các header này trong response
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // ✅ Cache preflight (OPTIONS) trong 1 giờ
        configuration.setMaxAge(3600L);

        // ✅ Đăng ký CORS config cho tất cả endpoint
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - load từ SecurityEndpoints
                        .requestMatchers(securityEndpoints.getPublicEndpointsArray()).permitAll()

                        // Role-based endpoints
                        .requestMatchers(securityEndpoints.getPremiumRoleEndpointsArray()).hasRole("PREMIUM")
                        .requestMatchers(securityEndpoints.getStandardRoleEndpointsArray()).hasAnyRole("STANDARD", "PREMIUM")

                        // Authenticated endpoints
                        .requestMatchers(securityEndpoints.getAuthenticatedEndpointsArray()).authenticated()

                        // Tất cả các request khác cần authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
