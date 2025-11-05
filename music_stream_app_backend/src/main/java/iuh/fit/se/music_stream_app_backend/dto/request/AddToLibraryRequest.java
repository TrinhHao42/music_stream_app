package iuh.fit.se.music_stream_app_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToLibraryRequest {
    private String itemId;
}

