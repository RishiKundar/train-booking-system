package com.trainbooking.bookingservice.service;

import com.trainbooking.bookingservice.dto.CreateBookingRequest;
import com.trainbooking.bookingservice.eventmodel.BookingEvent;

import java.util.UUID;

public interface BookingCommandService {

    UUID createBooking(UUID userId, CreateBookingRequest createBookingRequest);

    UUID createBookingVersion2(UUID userId, CreateBookingRequest createBookingRequest);

    UUID createBookingAsync(UUID userId, CreateBookingRequest createBookingRequest);

    void processBooking(BookingEvent bookingEvent);
}
