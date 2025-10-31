# Hướng dẫn cấu hình Backend để Frontend kết nối được

## Vấn đề
Frontend chạy trên thiết bị di động (IP: 192.168.2.12) không thể kết nối tới Backend đang chạy trên localhost:8080

## Giải pháp

### 1. Backend cần cho phép CORS từ mọi nguồn (hoặc từ IP cụ thể)

Thêm CORS configuration trong backend (Spring Boot):

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // Hoặc chỉ định: "http://192.168.2.12:8081"
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

### 2. Backend cần bind tới 0.0.0.0 thay vì 127.0.0.1

Trong `application.properties`:
```properties
server.port=8080
server.address=0.0.0.0
```

Hoặc khi chạy Spring Boot:
```bash
java -jar app.jar --server.address=0.0.0.0
```

### 3. Kiểm tra Firewall

Đảm bảo Windows Firewall cho phép port 8080:
- Mở Windows Defender Firewall
- Inbound Rules → New Rule
- Port → TCP → 8080 → Allow connection

### 4. Test Backend từ mobile

Mở trình duyệt trên điện thoại và thử truy cập:
```
http://192.168.2.12:8080/api/auth/login
```

Nếu thấy response hoặc 404 (không phải connection refused) là OK!

## Frontend đã được cấu hình
- ✅ Sử dụng IP: 192.168.2.12:8080
- ✅ Tự động dùng localhost cho web
- ✅ Sử dụng IP thật cho mobile/emulator
