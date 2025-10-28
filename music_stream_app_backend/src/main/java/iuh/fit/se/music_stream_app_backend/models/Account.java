package iuh.fit.se.music_stream_app_backend.models;

import iuh.fit.se.music_stream_app_backend.models.enums.Type;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    private ObjectId accountId;
    private String avatarUrl;
    private String email;
    private String password;
    private Type type;
}
