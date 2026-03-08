package com.trainbooking.bookingservice.dto;

import com.trainbooking.bookingservice.entity.BookingStatus;

import java.time.LocalDate;
import java.util.UUID;

public record BookingResponse(
        UUID bookingId,
        Long trainId,
        LocalDate travelDate,
        Integer seatsBooked,
        BookingStatus status
) {
}
