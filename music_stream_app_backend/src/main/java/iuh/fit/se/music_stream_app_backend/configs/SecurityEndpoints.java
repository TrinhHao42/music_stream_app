package iuh.fit.se.music_stream_app_backend.configs;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Getter
public class SecurityEndpoints {

    // ==================== PUBLIC ENDPOINTS ====================
    // Các endpoints này KHÔNG CẦN authentication, ai cũng truy cập được

    private final List<String> publicEndpoints = Arrays.asList(
            // Authentication endpoints
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh-token",

            // Swagger/API Documentation
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",

            // Artists endpoints - public
            "/artists/**",

            // Songs endpoints - public
            "/songs/**",

            // Albums endpoints - public
            "/albums/**"
    );

    // ==================== AUTHENTICATED ENDPOINTS ====================
    // Các endpoints này CẦN authentication (bất kỳ user nào đăng nhập)

    private final List<String> authenticatedEndpoints = Arrays.asList(
            // Playlists - cần đăng nhập
            "/playlists/**",

            // Current user info and logout
            "/api/auth/me",
            "/api/auth/logout"
    );

    // ==================== ROLE-BASED ENDPOINTS ====================
    // Các endpoints phân quyền theo role

    // STANDARD role - User thường
    private final List<String> standardRoleEndpoints = Arrays.asList(
            "/user/**"
    );

    // PREMIUM role - User premium
    private final List<String> premiumRoleEndpoints = Arrays.asList(
            "/premium/**"
    );

    // ==================== HELPER METHODS ====================

    /**
     * Lấy tất cả public endpoints dưới dạng array
     */
    public String[] getPublicEndpointsArray() {
        return publicEndpoints.toArray(new String[0]);
    }

    /**
     * Lấy tất cả authenticated endpoints dưới dạng array
     */
    public String[] getAuthenticatedEndpointsArray() {
        return authenticatedEndpoints.toArray(new String[0]);
    }

    /**
     * Lấy tất cả standard role endpoints dưới dạng array
     */
    public String[] getStandardRoleEndpointsArray() {
        return standardRoleEndpoints.toArray(new String[0]);
    }

    /**
     * Lấy tất cả premium role endpoints dưới dạng array
     */
    public String[] getPremiumRoleEndpointsArray() {
        return premiumRoleEndpoints.toArray(new String[0]);
    }
}
