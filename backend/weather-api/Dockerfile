# Use a reliable JDK 17 base image (works with any IDE)
FROM eclipse-temurin:17-jdk

# Set working directory in container
WORKDIR /app

# Copy the built jar into the image
COPY target/weatherapi-0.0.1-SNAPSHOT.jar app.jar

# Use Render's PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Start your Spring Boot application
CMD ["java", "-jar", "app.jar"]
