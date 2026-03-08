package com.trainbooking.bookingservice.service;

import com.trainbooking.bookingservice.dto.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingQueryService {

    List<BookingResponse> getBookingForUser(UUID userId);
}
