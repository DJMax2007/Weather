# Stage 1: Build with Maven 3.6.3 + JDK 8
FROM maven:3.6.3-jdk-8 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK 8
FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/weather-api-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-jar", "app.jar"]
