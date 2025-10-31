package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.dto.request.LoginRequest;
import iuh.fit.se.music_stream_app_backend.dto.request.RegisterRequest;
import iuh.fit.se.music_stream_app_backend.dto.response.AuthResponse;
import iuh.fit.se.music_stream_app_backend.exception.InvalidTokenException;
import iuh.fit.se.music_stream_app_backend.exception.ResourceAlreadyExistsException;
import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.models.Account;
import iuh.fit.se.music_stream_app_backend.models.User;
import iuh.fit.se.music_stream_app_backend.models.enums.Type;
import iuh.fit.se.music_stream_app_backend.repository.AccountRepository;
import iuh.fit.se.music_stream_app_backend.repository.UserRepository;
import iuh.fit.se.music_stream_app_backend.service.AuthService;
import iuh.fit.se.music_stream_app_backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (accountRepository.findByEmail(request.getEmail()) != null) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại: " + request.getEmail());
        }

        // Tạo User mới
        User user = User.builder()
                .userName(request.getUserName())
                .playlists(new ArrayList<>())
                .followList(new ArrayList<>())
                .likeList(new ArrayList<>())
                .favouriteAlbums(new ArrayList<>())
                .build();

        User savedUser = userRepository.save(user);

        // Tạo Account mới
        Account account = Account.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .type(Type.STANDARD)
                .userId(savedUser.getUserId())
                .avatarUrl(null)
                .build();

        accountRepository.save(account);

        // Tạo JWT tokens
        String accessToken = jwtUtils.generateAccessToken(request.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(savedUser)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Xác thực thông tin đăng nhập - BadCredentialsException sẽ tự đ��ng throw nếu sai
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Lấy thông tin account
        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new ResourceNotFoundException("Account", "email", request.getEmail());
        }

        // Thử query trực tiếp
        List<User> allUsers = userRepository.findAll();
        System.out.println("Total users in DB: " + allUsers.size());
        if (!allUsers.isEmpty()) {

            // Check xem có user nào match không
            boolean found = allUsers.stream()
                    .anyMatch(u -> u.getUserId().equals(account.getUserId()));
        }

        // Lấy thông tin user
        User user = userRepository.findById(account.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", account.getUserId()));

        // Tạo JWT tokens
        String accessToken = jwtUtils.generateAccessToken(request.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(user)
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // Lấy email từ refresh token
        String email = jwtUtils.getEmailFromToken(refreshToken);

        // Lấy thông tin account và user
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new ResourceNotFoundException("Account", "email", email);
        }

        User user = userRepository.findById(account.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", account.getUserId()));

        // Tạo JWT tokens mới
        String newAccessToken = jwtUtils.generateAccessToken(email);
        String newRefreshToken = jwtUtils.generateRefreshToken(email);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(user)
                .build();
    }

    @Override
    public User getCurrentUser(String email) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new ResourceNotFoundException("Account", "email", email);
        }

        return userRepository.findById(account.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", account.getUserId()));
    }
}
