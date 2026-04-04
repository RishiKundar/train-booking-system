package com.gateway.apigateway.config;


import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.reactive.config.EnableWebFlux;

@Configuration
@EnableWebFlux
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtSecurityContextRepository securityContextRepository;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(@NotNull ServerHttpSecurity httpSecurity){

        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .httpBasic( h -> h.disable())
                .formLogin(form -> form.disable())
                .securityContextRepository(securityContextRepository)
                .authorizeExchange( exchange -> exchange
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyExchange().authenticated()
                )
                .exceptionHandling( ex -> ex
                        .authenticationEntryPoint((exchange, e) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            return exchange.getResponse().setComplete();
                        }))
                .build();
    }
}
