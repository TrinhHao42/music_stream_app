package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.models.Artist;
import iuh.fit.se.music_stream_app_backend.repository.ArtistRepository;
import iuh.fit.se.music_stream_app_backend.service.ArtistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ArtistServiceImpl implements ArtistService {
    ArtistRepository artistRepository;

    @Override
    public Artist AddArtist(Artist artist) {
        return artistRepository.save(artist);
    }

    @Override
    public Artist findArtistById(String id) {
        return artistRepository.findById(id).orElse(null);
    }

    @Override
    public Page<Artist> findAllArtists(Pageable pageable) {
        return artistRepository.findAll(pageable);
    }

    @Override
    public Page<Artist> findArtistByName(String name, Pageable pageable) {
        // Cách 1: Tìm kiếm thông thường (case-insensitive)
        String searchTerm = name.trim();
        Page<Artist> result = artistRepository.findByArtistNameRegex(searchTerm, pageable);

        // Nếu không tìm thấy, thử loại bỏ dấu và tìm lại
        if (result.isEmpty()) {
            // Lấy tất cả artists và filter trong Java
            String normalizedSearch = removeAccents(searchTerm).toLowerCase();
            List<Artist> allArtists = artistRepository.findAll();

            List<Artist> filtered = allArtists.stream()
                    .filter(artist -> removeAccents(artist.getArtistName()).toLowerCase().contains(normalizedSearch))
                    .skip((long) pageable.getPageNumber() * pageable.getPageSize())
                    .limit(pageable.getPageSize())
                    .collect(Collectors.toList());

            long total = allArtists.stream()
                    .filter(artist -> removeAccents(artist.getArtistName()).toLowerCase().contains(normalizedSearch))
                    .count();

            return new PageImpl<>(filtered, pageable, total);
        }

        return result;
    }

    // Helper method để loại bỏ dấu tiếng Việt
    private String removeAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("");
    }
}
