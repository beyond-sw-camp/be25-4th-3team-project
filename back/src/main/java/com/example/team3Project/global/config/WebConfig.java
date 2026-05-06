package com.example.team3Project.global.config;

import com.example.team3Project.global.interceptor.JwtCheckInterceptor;
import com.example.team3Project.global.resolver.LoginUserArgumentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtCheckInterceptor jwtCheckInterceptor;
    private final LoginUserArgumentResolver loginUserArgumentResolver;

    @Value("${app.gateway-url:http://localhost:8081}")
    private String gatewayUrl;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origin-patterns:https://*.ngrok-free.dev,https://*.vercel.app}")
    private String corsAllowedOriginPatterns;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtCheckInterceptor)
                .addPathPatterns("/users/me", "/users/update", "/users/delete")
                .excludePathPatterns("/users/login", "/users/signup", "/users/find-id", "/users/reset-pw");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserArgumentResolver);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> allowedOriginPatterns = new java.util.ArrayList<>(Arrays.asList(
                gatewayUrl,
                frontendUrl,
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));
        allowedOriginPatterns.addAll(Arrays.stream(corsAllowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(pattern -> !pattern.isEmpty())
                .toList());

        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
