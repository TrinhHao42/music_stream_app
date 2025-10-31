package iuh.fit.se.music_stream_app_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

@SpringBootApplication
public class MusicStreamAppBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicStreamAppBackendApplication.class, args);
        System.out.println("Music Stream App Backend is running...");
    }
//    @Bean
//    public MongoCustomConversions customConversions() {
//        Converter<String, LocalDate> stringToLocalDateConverter = new Converter<>() {
//            @Override
//            public LocalDate convert(String source) {
//                // ép theo định dạng dd/MM/yyyy
//                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
//                return LocalDate.parse(source, formatter);
//            }
//        };
//        return new MongoCustomConversions(Collections.singletonList(stringToLocalDateConverter));
//    }
}
