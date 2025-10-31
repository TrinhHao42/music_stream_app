# ==== Build stage ====
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ==== Runtime stage ====
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV JAVA_OPTS=""
# MONGODB_URI sẽ được truyền từ env (docker run/compose)
ENV MONGODB_URI="mongodb://localhost:27017/music_stream_app"
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
