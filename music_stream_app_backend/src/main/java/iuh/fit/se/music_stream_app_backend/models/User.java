package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Field("_id")
    private String userId;

    private String userName;
    private boolean gender;
    private LocalDate birthday;
    private List<String> playlists; // Lưu danh sách playlist IDs
    private List<String> followList; // Lưu danh sách artist IDs
    private List<String> likeList; // Lưu danh sách song IDs
    private List<String> favouriteAlbums; // Lưu danh sách album IDs
}
