package iuh.fit.se.music_stream_app_backend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
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
    private LocalDate release;
    private double duration;
    private long listens;
    private long likes;

    @DBRef
    private Album album;

    @DBRef
    private List<Artist> artists;
}
