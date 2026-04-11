package com.trainbooking.userservice.auth.controller;

import com.trainbooking.userservice.auth.dto.LoginRequest;
import com.trainbooking.userservice.auth.dto.SignupRequest;
import com.trainbooking.userservice.auth.dto.TokenResponse;
import com.trainbooking.userservice.auth.service.AuthService;
import com.trainbooking.userservice.auth.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, token refresh, and logout. No authentication required.")
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @PostMapping("/signup")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account. Default role is USER. To create an ADMIN account, include role: ADMIN in the request body."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed — missing or invalid fields"),
        @ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public ResponseEntity<?> signUp(@Valid @RequestBody SignupRequest signupRequest) {
        authService.signUp(signupRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    @Operation(
        summary = "Login and get tokens",
        description = "Authenticates the user and returns a JWT access token and refresh token. " +
                      "Include the access token in the Authorization header as 'Bearer {token}' for all secured endpoints."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful — returns accessToken and refreshToken"),
        @ApiResponse(responseCode = "400", description = "Validation failed"),
        @ApiResponse(responseCode = "401", description = "Invalid email or password")
    })
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh access token",
        description = "Generates a new access token using a valid refresh token. Use this when the access token expires (default: 15 minutes)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "New access token issued"),
        @ApiResponse(responseCode = "401", description = "Refresh token is invalid or expired")
    })
    public ResponseEntity<TokenResponse> refresh(@RequestParam String refreshToken) {
        return ResponseEntity.ok(tokenService.refreshAccessToken(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Logout",
        description = "Invalidates the refresh token server-side. The access token will continue to work until it expires — clients should discard it locally."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logged out successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid or already expired refresh token")
    })
    public ResponseEntity<?> logout(@RequestParam String refreshToken) {
        tokenService.logout(refreshToken);
        return ResponseEntity.ok("Logged Out Successfully");
    }
}
