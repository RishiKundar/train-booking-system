package com.trainbooking.bookingservice.service;

import com.trainbooking.bookingservice.dto.SeatAvailabilityResponse;

import java.time.LocalDate;

public interface SeatAvailabilityService {

    SeatAvailabilityResponse getAvailability(Long trainId, LocalDate travelDate);
}
