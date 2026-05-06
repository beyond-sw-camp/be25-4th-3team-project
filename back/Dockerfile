FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY . .
RUN ./gradlew clean bootJar -x test

FROM eclipse-temurin:17-jre
WORKDIR /app

ARG BUILD_PROFILE=dev
ARG BUILD_PORT=8087

ENV TZ=Asia/Seoul
ENV SPRING_PROFILES_ACTIVE=${BUILD_PROFILE}

COPY --from=builder /app/build/libs/autosource-0.0.1-SNAPSHOT.jar autosource-0.0.1-SNAPSHOT.jar

EXPOSE ${BUILD_PORT}
ENTRYPOINT ["java", "-jar", "autosource-0.0.1-SNAPSHOT.jar"]
