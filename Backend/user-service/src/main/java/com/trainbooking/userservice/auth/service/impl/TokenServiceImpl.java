package com.trainbooking.userservice.auth.service.impl;


import com.trainbooking.userservice.auth.dto.TokenResponse;
import com.trainbooking.userservice.auth.security.JwtTokenProvider;
import com.trainbooking.userservice.auth.service.TokenService;
import com.trainbooking.userservice.token.entity.RefreshToken;
import com.trainbooking.userservice.token.service.RefreshTokenService;
import com.trainbooking.userservice.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Override
    public TokenResponse generateTokens(User user) {

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenResponse(accessToken,refreshToken.getToken());
    }

    @Override
    public TokenResponse refreshAccessToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenValue);

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        return new TokenResponse(newAccessToken,refreshTokenValue);
    }

    @Override
    public void logout(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenValue);
        refreshTokenService.revokeToken(refreshToken);
    }
}
