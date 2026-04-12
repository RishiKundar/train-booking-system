package com.trainbooking.bookingservice.service;

import com.trainbooking.bookingservice.dto.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.awt.*;
import java.util.List;
import java.util.UUID;

public interface BookingQueryService {

    Page<BookingResponse> getBookingForUser(UUID userId, Pageable pageable);

    BookingResponse getBookingByPnr(String pnr, UUID userId);
}
