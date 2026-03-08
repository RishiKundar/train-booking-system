package com.trainbooking.bookingservice.controller;


import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.dto.CreateBookingRequest;
import com.trainbooking.bookingservice.service.BookingCommandService;
import com.trainbooking.bookingservice.service.BookingQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/booking/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingQueryService bookingQueryService;
    private final BookingCommandService bookingCommandService;

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(HttpServletRequest httpServletRequest){
        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");
        return bookingQueryService.getBookingForUser(userId);
    }

    @PostMapping
    public Map<String, Object> createBooking(HttpServletRequest httpServletRequest,@Valid @RequestBody CreateBookingRequest request){

        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");

        UUID bookingId = bookingCommandService.createBooking(userId,request);

        return Map.of("bookingId",bookingId,"status","BOOKED");
    }
}
