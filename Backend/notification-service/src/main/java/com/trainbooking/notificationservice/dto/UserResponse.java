package com.trainbooking.notificationservice.dto;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String emailId,
        String mobileNo
) {
}
