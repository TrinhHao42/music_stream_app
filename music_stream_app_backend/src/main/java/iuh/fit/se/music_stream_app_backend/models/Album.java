package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "albums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {
    @Id
    private String albumId;

    private String albumName;
    private LocalDate release;
    private long listens;
    private long favourites;
    private String image; // 👉 đường dẫn ảnh bìa

    @DBRef
    private List<Artist> artists;

    @DBRef
    private List<Song> songs;
}
