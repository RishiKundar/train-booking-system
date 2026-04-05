package com.trainbooking.bookingservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateBookingRequest(

        @NotNull(message = "Idempotency Key is required")
        String idempotencyKey,

        @NotNull(message = "Train ID is required")
        Long trainId,

        @NotNull(message = "Source Station Id is required")
        Long sourceStationId,

        @NotNull(message = "Destination Station Id is required")
        Long destinationStationId,

        @NotNull(message = "Travel Date is required")
        LocalDate travelDate,

        @NotNull(message = "Seat Class is required")
        String seatClass,

        @NotNull(message = "Please select valid seat")
        @Min(value = 1, message = "Seat count should be at least 1")
        Integer seats

) {
}
