# Stage 1: Build with Maven + JDK 8
FROM maven:3.5.2-jdk-8 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK 8
FROM openjdk:8-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/your-app.jar app.jar
CMD ["java", "-jar", "app.jar"]
