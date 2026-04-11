package com.trainbooking.trainservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final XUserIdFilter xUserIdFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        .requestMatchers("/train/internal/**").permitAll()

                        // ADMIN only for all write operations across ALL train endpoints
                        .requestMatchers(HttpMethod.POST,   "/train/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/train/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/train/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/train/**").hasRole("ADMIN")
                        // Any authenticated user can read
                        .requestMatchers(HttpMethod.GET, "/train/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(xUserIdFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
