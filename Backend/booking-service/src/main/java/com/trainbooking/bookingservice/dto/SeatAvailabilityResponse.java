package com.trainbooking.bookingservice.dto;

import java.time.LocalDate;

public record SeatAvailabilityResponse(
        Long trainId,
        LocalDate travelDate,
        Integer availableSeats
) {
}
