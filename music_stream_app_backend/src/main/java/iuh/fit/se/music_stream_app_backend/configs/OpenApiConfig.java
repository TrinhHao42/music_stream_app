package iuh.fit.se.music_stream_app_backend.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("Music Stream App Backend API")
                .version("v1.0.0")
                .description("API documentation for the Music Stream App Backend"))
                .servers(List.of(new Server().url("http://localhost:8080/")));
    }

    @Bean
    public GroupedOpenApi groupedOpenApi() {
        return GroupedOpenApi.builder()
                .group("music-stream-app-backend")
                .packagesToScan("iuh.fit.se.music_stream_app_backend.controller")
                .build();
    }
}
