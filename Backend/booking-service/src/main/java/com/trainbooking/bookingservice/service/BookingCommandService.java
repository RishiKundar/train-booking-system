package com.trainbooking.bookingservice.service;

import com.trainbooking.bookingservice.dto.CreateBookingRequest;

import java.util.UUID;

public interface BookingCommandService {

    UUID createBooking(UUID userId, CreateBookingRequest createBookingRequest);
}
