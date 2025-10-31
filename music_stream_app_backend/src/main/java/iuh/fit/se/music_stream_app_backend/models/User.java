package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String userId;

    @Field("user_name")
    private String userName;

    @Field("playlists")
    private List<String> playlists;

    @Field("follow_list")
    private List<String> followList;

    @Field("like_list")
    private List<String> likeList;

    @Field("favourite_albums")
    private List<String> favouriteAlbums;
}
