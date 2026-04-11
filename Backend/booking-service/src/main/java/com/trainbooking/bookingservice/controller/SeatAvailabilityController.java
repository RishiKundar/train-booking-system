package com.trainbooking.bookingservice.controller;

import com.trainbooking.bookingservice.dto.SeatAvailabilityResponse;
import com.trainbooking.bookingservice.service.SeatAvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping(path = "/booking/availability")
@RequiredArgsConstructor
@Tag(name = "Seat Availability", description = "To check seat availability")
public class SeatAvailabilityController {

    private final SeatAvailabilityService seatAvailabilityService;

    @Operation(summary = "Get Seat Availability")
    @ApiResponse(responseCode = "200", description = "Seat Availability fetched successfully")
    @ApiResponse(responseCode = "500", description = "Something went wrong")
    @GetMapping
    public SeatAvailabilityResponse getSeatAvailabilityResponse(@RequestParam Long trainId,
                                                                @RequestParam
                                                                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        return seatAvailabilityService.getAvailability(trainId,date);
    }



}
