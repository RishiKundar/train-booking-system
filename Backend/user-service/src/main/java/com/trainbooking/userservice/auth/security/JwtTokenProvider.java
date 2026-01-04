package com.trainbooking.userservice.auth.security;


import com.trainbooking.userservice.resourcebundle.JwtProperties;
import com.trainbooking.userservice.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final Key key;

    public JwtTokenProvider(JwtProperties jwtProperties){
        this.jwtProperties = jwtProperties;
        String secret = jwtProperties.getSecret();
        System.out.println("JWT SECRET LENGTH = " + (secret != null ? secret.length() : "null"));
        this.key = Keys.
                hmacShaKeyFor(jwtProperties.
                        getSecret()
                        .getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user){
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtProperties.getAccessTokenExpiry());

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmailId())
                .claim("roles", user.getRoles().stream().map(role -> role.getRole()).collect(Collectors.toList()))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> validateToken(String token){
        return Jwts.parser().setSigningKey(key).build().parseClaimsJws(token);
    }

}
