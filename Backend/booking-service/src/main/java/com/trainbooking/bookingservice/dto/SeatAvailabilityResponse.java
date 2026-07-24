package com.trainbooking.bookingservice.dto;

import java.time.LocalDate;
import java.util.Map;

public record SeatAvailabilityResponse(
        Long trainId,
        LocalDate travelDate,
        Map<String, Integer> availabilityByClass  // e.g. {"SLEEPER": 200, "AC_3_TIER": 150}
) {
}
