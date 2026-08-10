package com.trainbooking.userservice.auth.service.impl;

import com.trainbooking.userservice.auth.dto.LoginRequest;
import com.trainbooking.userservice.auth.dto.SignupRequest;
import com.trainbooking.userservice.auth.dto.TokenResponse;
import com.trainbooking.userservice.auth.service.AuthService;
import com.trainbooking.userservice.auth.service.TokenService;
import com.trainbooking.userservice.role.entity.Role;
import com.trainbooking.userservice.role.repo.RoleRepository;
import com.trainbooking.userservice.user.entity.User;
import com.trainbooking.userservice.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;


    @Override
    public void signUp(SignupRequest signupRequest) {
        if(userRepository.existsByEmailId(signupRequest.getEmail())){
            throw new AuthException("Email is already registered. Please sign in or use another email.", "AUTH_004");
        }

        if(userRepository.existsByUsername(signupRequest.getUsername())){
            throw new AuthException("Username is already taken. Please choose another username.", "AUTH_005");
        }

        if(userRepository.existsByMobileNo(signupRequest.getMobileNo())){
            throw new AuthException("Mobile number is already registered. Please use another number.", "AUTH_006");
        }

        Role userRole = roleRepository.findByRole("ROLE_USER")
                .orElseThrow( () -> new AuthException("Role USER not configured in database", "AUTH_007"));

        User user = User.builder()
                .username(signupRequest.getUsername())
                .firstName(signupRequest.getFirstName())
                .middleName(signupRequest.getMiddleName())
                .lastName(signupRequest.getLastName())
                .emailId(signupRequest.getEmail())
                .mobileNo(signupRequest.getMobileNo())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .roles(Set.of(userRole))
                .activeFlag(true)
                .isAccountLocked(false)
                .build();

        userRepository.save(user);
    }

    @Override
    public TokenResponse login(LoginRequest loginRequest) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        User user = userRepository.findByEmailId(loginRequest.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        return tokenService.generateTokens(user);
    }

    @Override
    public void createAdmin(SignupRequest signupRequest) {

        if(userRepository.existsByEmailId(signupRequest.getEmail())){
            throw new RuntimeException("Email already registered");
        }

        if(userRepository.existsByUsername(signupRequest.getUsername())){
            throw new RuntimeException("Username already taken");
        }

        if(userRepository.existsByMobileNo(signupRequest.getMobileNo())){
            throw new RuntimeException("Mobile already registered");
        }

        Role userRole = roleRepository.findByRole("ROLE_ADMIN")
                .orElseThrow( () -> new RuntimeException("Role USER not found"));

        User user = User.builder()
                .username(signupRequest.getUsername())
                .firstName(signupRequest.getFirstName())
                .middleName(signupRequest.getMiddleName())
                .lastName(signupRequest.getLastName())
                .emailId(signupRequest.getEmail())
                .mobileNo(signupRequest.getMobileNo())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .roles(Set.of(userRole))
                .activeFlag(true)
                .isAccountLocked(false)
                .build();

        userRepository.save(user);
    }

}
