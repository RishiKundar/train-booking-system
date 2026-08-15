package com.trainbooking.bookingservice.dto;

import com.trainbooking.bookingservice.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record EnrichedBookingResponse(
        UUID id,
        String pnr,
        String trainName,
        String trainCode,
        String trainType,
        String sourceName,
        String sourceCity,
        String destName,
        String destCity,
        LocalDate travelDate,
        LocalTime departureTime,
        LocalTime arrivalTime,
        Integer distanceKm,
        String seatClass,
        Integer seatsBooked,
        BigDecimal fare,
        BookingStatus status,
        boolean isUpcoming
) {
}
