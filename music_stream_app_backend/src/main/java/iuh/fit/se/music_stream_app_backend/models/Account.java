package iuh.fit.se.music_stream_app_backend.models;

import iuh.fit.se.music_stream_app_backend.models.enums.Type;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    private String accountId;

    @Field("avatar_url")
    private String avatarUrl;

    @Field("email")
    private String email;

    @Field("password")
    private String password;

    @Field("type")
    private Type type;

    @Field("user_id")
    private String userId; // Lưu reference bằng ID thay vì @DBRef
}
