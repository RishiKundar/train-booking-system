package com.trainbooking.bookingservice.controller;

import com.trainbooking.bookingservice.dto.SeatAvailabilityResponse;
import com.trainbooking.bookingservice.service.SeatAvailabilityService;
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
public class SeatAvailabilityController {

    private final SeatAvailabilityService seatAvailabilityService;

    @GetMapping
    public SeatAvailabilityResponse getSeatAvailabilityResponse(@RequestParam Long trainId,
                                                                @RequestParam
                                                                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        return seatAvailabilityService.getAvailability(trainId,date);
    }



}
