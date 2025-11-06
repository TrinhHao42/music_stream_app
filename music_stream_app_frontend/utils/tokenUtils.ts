// Utility functions để xử lý JWT token

interface JwtPayload {
  sub: string; // email
  iat: number; // issued at
  exp: number; // expiration
}

/**
 * Decode JWT token để lấy payload (không verify signature)
 */
export const decodeJWT = (token: string): JwtPayload | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Kiểm tra xem token có sắp hết hạn không (trong vòng X phút)
 */
export const isTokenExpiringSoon = (token: string, minutesBeforeExpiry: number = 5): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;
  const minutesInMs = minutesBeforeExpiry * 60 * 1000;

  return timeUntilExpiry < minutesInMs;
};

/**
 * Kiểm tra xem token đã hết hạn chưa
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= expirationTime;
};

/**
 * Lấy thời gian còn lại của token (ms)
 */
export const getTokenTimeRemaining = (token: string): number => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;

  return Math.max(0, remaining);
};

/**
 * Format thời gian còn lại thành string dễ đọc
 */
export const formatTimeRemaining = (token: string): string => {
  const ms = getTokenTimeRemaining(token);
  
  if (ms === 0) {
    return 'Đã hết hạn';
  }

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ngày`;
  } else if (hours > 0) {
    return `${hours} giờ`;
  } else if (minutes > 0) {
    return `${minutes} phút`;
  } else {
    return 'Dưới 1 phút';
  }
};

/**
 * Log thông tin token để debug
 */
export const logTokenInfo = (token: string, tokenType: 'access' | 'refresh'): void => {
  const payload = decodeJWT(token);
  if (!payload) {
    console.log(`❌ ${tokenType} token không hợp lệ`);
    return;
  }

  const issuedAt = new Date(payload.iat * 1000);
  const expiresAt = new Date(payload.exp * 1000);
  const now = new Date();
  const timeRemaining = getTokenTimeRemaining(token);

  console.log(`📝 ${tokenType.toUpperCase()} TOKEN INFO:`);
  console.log(`   Email: ${payload.sub}`);
  console.log(`   Issued at: ${issuedAt.toLocaleString()}`);
  console.log(`   Expires at: ${expiresAt.toLocaleString()}`);
  console.log(`   Current time: ${now.toLocaleString()}`);
  console.log(`   Time remaining: ${formatTimeRemaining(token)}`);
  console.log(`   Is expired: ${isTokenExpired(token) ? '❌ Yes' : '✅ No'}`);
  console.log(`   Expiring soon (5 min): ${isTokenExpiringSoon(token, 5) ? '⚠️ Yes' : '✅ No'}`);
};

