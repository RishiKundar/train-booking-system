package com.gateway.apigateway.config;


import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.stream.Collectors;

@Component
public class UserContextFilter implements GlobalFilter {


    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        return exchange.getPrincipal()
                .cast(Authentication.class)
                .flatMap(auth -> {
                    String userId = auth.getName();

                    // Collect roles as comma-separated string e.g. "ADMIN,USER"
                    String roles = auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.joining(","));

                    ServerHttpRequest httpRequest = exchange.getRequest().mutate()
                            .header("X-User-Id", userId)
                            .header("X-User-Roles", roles)
                            .build();

                    return chain.filter(exchange.mutate().request(httpRequest).build());

                })
                .switchIfEmpty(chain.filter(exchange)); // Always forward if no principal (e.g. /api/auth/**)
    }
}
