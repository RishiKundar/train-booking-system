package com.trainbooking.userservice.auth.controller;


import com.trainbooking.userservice.user.dto.UserResponse;
import com.trainbooking.userservice.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id){
        return userRepository.findById(id).map(user -> new UserResponse(user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmailId(),
                user.getMobileNo()
        )).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
