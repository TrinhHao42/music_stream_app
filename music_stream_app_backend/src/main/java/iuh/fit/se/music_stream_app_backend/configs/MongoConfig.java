package iuh.fit.se.music_stream_app_backend.configs;

import com.mongodb.client.model.Collation;
import com.mongodb.client.model.CollationStrength;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    @Bean
    public Collation vietnameseCollation() {
        return Collation.builder()
                .locale("vi")
                .collationStrength(CollationStrength.PRIMARY)
                .build();
    }
}
