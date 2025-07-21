# Stage 1: Build the app with Maven
FROM maven:3.8.6-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final image to run the app
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/weather-api-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-jar", "app.jar"]
