package com.trainbooking.userservice.user.dto;

import java.util.UUID;

public record UserResponse(
        UUID userId,
        String firstName,
        String lastName,
        String emailId,
        String mobileNo
)
{}
