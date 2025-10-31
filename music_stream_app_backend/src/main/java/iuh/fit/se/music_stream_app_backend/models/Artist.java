package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "artists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist {
    @Id
    private String artistId;

    private String artistName;

    @DBRef
    private List<Album> albums;

    @DBRef
    private List<Song> songs;
    private long followers;


}
