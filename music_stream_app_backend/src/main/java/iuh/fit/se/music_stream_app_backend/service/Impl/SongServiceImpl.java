package iuh.fit.se.music_stream_app_backend.service.Impl;

import iuh.fit.se.music_stream_app_backend.exception.ResourceNotFoundException;
import iuh.fit.se.music_stream_app_backend.models.Song;
import iuh.fit.se.music_stream_app_backend.repository.SongRepository;
import iuh.fit.se.music_stream_app_backend.service.SongService;
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
public class SongServiceImpl implements SongService {
    SongRepository songRepository;

    @Override
    public Song AddSong(Song song) {
        return songRepository.save(song);
    }

    @Override
    public Page<Song> findAllSongs(Pageable pageable) {
        return songRepository.findAll(pageable);
    }

    @Override
    public Song findSongById(String id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", id));
    }

    @Override
    public List<Song> getSongsByAlbumName(String albumName) {
        // Cách 1: Tìm kiếm thông thường (case-insensitive)
        String searchTerm = albumName.trim();
        List<Song> result = songRepository.findByAlbumNameRegex(searchTerm);

        // Nếu không tìm thấy, thử loại bỏ dấu và tìm lại
        if (result.isEmpty()) {
            String normalizedSearch = removeAccents(searchTerm).toLowerCase();
            List<Song> allSongs = songRepository.findAll();

            result = allSongs.stream()
                .filter(song -> song.getAlbum() != null &&
                               removeAccents(song.getAlbum().getAlbumName()).toLowerCase().contains(normalizedSearch))
                .collect(Collectors.toList());
        }

        return result;
    }

    @Override
    public Page<Song> getSongsByArtist(List<String> artistNames, Pageable pageable) {
        return songRepository.getSongsByArtistIn(artistNames, pageable);
    }

    @Override
    public Page<Song> getSongsByName(String name, Pageable pageable) {
        // Cách 1: Tìm kiếm thông thường (case-insensitive)
        String searchTerm = name.trim();
        Page<Song> result = songRepository.findByTitleRegex(searchTerm, pageable);

        // Nếu không tìm thấy, thử loại bỏ dấu và tìm lại
        if (result.isEmpty()) {
            // Lấy tất cả songs và filter trong Java
            String normalizedSearch = removeAccents(searchTerm).toLowerCase();
            List<Song> allSongs = songRepository.findAll();

            List<Song> filtered = allSongs.stream()
                .filter(song -> removeAccents(song.getTitle()).toLowerCase().contains(normalizedSearch))
                .skip((long) pageable.getPageNumber() * pageable.getPageSize())
                .limit(pageable.getPageSize())
                .collect(Collectors.toList());

            long total = allSongs.stream()
                .filter(song -> removeAccents(song.getTitle()).toLowerCase().contains(normalizedSearch))
                .count();

            return new PageImpl<>(filtered, pageable, total);
        }

        return result;
    }

    @Override
    public boolean deleteById(String id) {
        if (songRepository.existsById(id)) {
            songRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Helper method để loại bỏ dấu tiếng Việt
    private String removeAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("");
    }
}
