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

        Account savedAccount = accountRepository.save(account);

        // Tạo JWT tokens
        String accessToken = jwtUtils.generateAccessToken(request.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(request.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(savedUser)
                .isPremium(savedAccount.getType() == Type.PREMIUM)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Xác thực thông tin đăng nhập - BadCredentialsException sẽ tự động throw nếu sai
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Lấy thông tin account
        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new ResourceNotFoundException("Account", "email", request.getEmail());
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
                .isPremium(account.getType() == Type.PREMIUM)
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
                .isPremium(account.getType() == Type.PREMIUM)
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

    @Override
    public void logout(String token) {
        // Validate token
        if (!jwtUtils.validateToken(token)) {
            throw new InvalidTokenException("Token không hợp lệ hoặc đã hết hạn");
        }

        // Trong trường hợp đơn giản, logout chỉ cần client xóa token
        // Nếu muốn blacklist token, có thể thêm logic ở đây
        // Ví dụ: lưu token vào Redis với TTL = thời gian hết hạn của token
    }
}
