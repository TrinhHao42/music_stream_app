package iuh.fit.se.music_stream_app_backend.dto.embedded;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumEmbedded {
    @Field("albumName")
    @JsonProperty("albumName")
    private String albumName;

    @Field("image")
    @JsonProperty("image")
    private String image;
}
