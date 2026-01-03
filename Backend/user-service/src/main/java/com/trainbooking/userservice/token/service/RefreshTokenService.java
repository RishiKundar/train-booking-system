package com.trainbooking.userservice.token.service;

import com.trainbooking.userservice.resourcebundle.JwtProperties;
import com.trainbooking.userservice.token.entity.RefreshToken;
import com.trainbooking.userservice.token.repo.RefreshTokenRepository;
import com.trainbooking.userservice.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    public RefreshToken createRefreshToken(User user){
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plus(jwtProperties.getRefreshTokenExpiry()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(token);
    }

    public RefreshToken verifyRefreshToken(String tokenValue){
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue).orElseThrow(() -> new RuntimeException("Invalid Refresh Token"));

        if(token.getRevoked()){
            throw new RuntimeException("Refresh token is revoked");
        }

        if(token.getExpiryDate().isBefore(LocalDateTime.now())){
            throw new RuntimeException("Refresh Token expired");
        }

        return token;
    }

    public void revokeToken(RefreshToken token){
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }
}
