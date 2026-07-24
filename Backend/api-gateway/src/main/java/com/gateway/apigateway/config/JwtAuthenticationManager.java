package com.gateway.apigateway.config;

import com.gateway.apigateway.service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    @Autowired
    private JwtService jwtService;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {

        String token = authentication.getCredentials().toString();

        try{

            Claims claims = jwtService.validateToken(token);

            String userId = claims.getSubject();
            List<String> roles = claims.get("roles",List.class);
            if(roles == null) roles = List.of();

            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            return Mono.just(
                    new UsernamePasswordAuthenticationToken(userId,null,authorities)
            );


        } catch (Exception e) {
            log.error("JWT Authentication Failed : {} ", e.getMessage());
            return Mono.empty();
        }
    }
}
