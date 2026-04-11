package com.trainbooking.bookingservice.dto;

import com.trainbooking.bookingservice.entity.BookingStatus;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BookingResponse(
        UUID bookingId,
        Long trainId,
        LocalDate travelDate,
        Integer seatsBooked,
        BookingStatus status,
        String seatClass,
        BigDecimal fare,
        Long sourceStationId,
        Long destinationStationId,
        String pnr
) {
}
