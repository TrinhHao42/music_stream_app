package iuh.fit.se.music_stream_app_backend.models.enums;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Getter
public enum Type {
    STANDARD("Standard"),
    PREMIUM("Premium");
    String typeName;
}
