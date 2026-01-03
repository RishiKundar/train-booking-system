package com.trainbooking.userservice.auth.service;

import com.trainbooking.userservice.auth.dto.LoginRequest;
import com.trainbooking.userservice.auth.dto.SignupRequest;
import com.trainbooking.userservice.auth.dto.TokenResponse;

public interface AuthService {

    void signUp(SignupRequest signupRequest);

    TokenResponse login(LoginRequest loginRequest);
}
