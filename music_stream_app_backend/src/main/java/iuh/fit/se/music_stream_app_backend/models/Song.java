package iuh.fit.se.music_stream_app_backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import iuh.fit.se.music_stream_app_backend.dto.embedded.AlbumEmbedded;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {
    @Id
    private String songId;

    private String title;
    private String release;
    private double duration;
    private long listens;
    private long likes;

    @Field("audioUrl")
    @JsonProperty("audioUrl")
    private String audioUrl;

    @Field("coverUrl")
    @JsonProperty("coverUrl")
    private String coverUrl;

    private AlbumEmbedded album;

    private List<String> artist;
}
