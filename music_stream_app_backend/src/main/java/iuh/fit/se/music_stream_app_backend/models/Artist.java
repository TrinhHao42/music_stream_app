package iuh.fit.se.music_stream_app_backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import iuh.fit.se.music_stream_app_backend.dto.embedded.AlbumEmbedded;
import iuh.fit.se.music_stream_app_backend.dto.embedded.SongEmbedded;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "artists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist {
    @Id
    private String artistId;

    @Field("artistName")
    @JsonProperty("artistName")
    private String artistName;

    @Field("artistImage")
    @JsonProperty("artistImage")
    private String artistImage;

    private List<AlbumEmbedded> albums;
    private List<SongEmbedded> songs;
    private long followers;
}
