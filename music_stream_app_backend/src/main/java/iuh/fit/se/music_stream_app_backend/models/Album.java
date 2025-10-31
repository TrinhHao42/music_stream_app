package iuh.fit.se.music_stream_app_backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import iuh.fit.se.music_stream_app_backend.dto.embedded.SongEmbedded;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "albums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {
    @Id
    private String albumId;

    @Field("albumName")
    @JsonProperty("albumName")
    private String albumName;

    @Field("release")
    @JsonProperty("release")
    private String release;

    private long listens;
    private long favourites;
    private String image;
    private List<String> artists;
    private List<SongEmbedded> songs;
}
