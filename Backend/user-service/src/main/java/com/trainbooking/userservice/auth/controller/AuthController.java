package com.trainbooking.userservice.auth.controller;


import com.trainbooking.userservice.auth.dto.LoginRequest;
import com.trainbooking.userservice.auth.dto.SignupRequest;
import com.trainbooking.userservice.auth.dto.TokenResponse;
import com.trainbooking.userservice.auth.service.AuthService;
import com.trainbooking.userservice.auth.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignupRequest signupRequest){
        authService.signUp(signupRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestParam String refreshToken){
        return ResponseEntity.ok(tokenService.refreshAccessToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam String refreshToken){
        tokenService.logout(refreshToken);
        return ResponseEntity.ok("Logged Out Successfully");
    }
}
