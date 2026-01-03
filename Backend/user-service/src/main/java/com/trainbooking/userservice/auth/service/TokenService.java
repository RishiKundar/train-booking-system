package com.trainbooking.userservice.auth.service;

import com.trainbooking.userservice.auth.dto.TokenResponse;
import com.trainbooking.userservice.user.entity.User;

public interface TokenService {

    TokenResponse generateTokens(User user);

    TokenResponse refreshAccessToken(String refreshToken);

    void logout(String refreshToken);
}
