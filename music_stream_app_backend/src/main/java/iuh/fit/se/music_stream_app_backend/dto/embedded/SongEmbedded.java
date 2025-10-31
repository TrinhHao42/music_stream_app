package iuh.fit.se.music_stream_app_backend.dto.embedded;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongEmbedded {
    @Field("title")
    @JsonProperty("title")
    private String title;

    @Field("coverUrl")
    @JsonProperty("coverUrl")
    private String coverUrl;
}
