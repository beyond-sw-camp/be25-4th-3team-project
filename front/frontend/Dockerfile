FROM node:20-alpine AS builder
WORKDIR /app
# package.json과 package-lock.json을 먼저 복사하여 의존성 설치를 캐싱할 수 있도록 함
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL=/api
ARG VITE_OAUTH_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_OAUTH_BASE_URL=${VITE_OAUTH_BASE_URL}
RUN npm run build

FROM nginx:stable-alpine3.23
LABEL maintainer="hong123 <hong123@beyond.com>"
LABEL version="1.0"
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
ENV TZ=Asia/Seoul
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
