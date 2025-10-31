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
    }
}
