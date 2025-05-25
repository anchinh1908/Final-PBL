FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests

# Run stage

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY --from=build /app/target/AI-Hotel-0.0.1-SNAPSHOT.war aihotel.war
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "aihotel.war"]