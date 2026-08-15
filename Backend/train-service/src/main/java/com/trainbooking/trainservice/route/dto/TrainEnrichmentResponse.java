package com.trainbooking.trainservice.route.dto;

import org.springframework.cglib.core.Local;

import java.time.LocalTime;

public record TrainEnrichmentResponse(
        String trainName,
        String trainCode,
        String trainType,
        String sourceName,
        String sourceCity,
        String destName,
        String destCity,
        LocalTime departureTime,
        LocalTime arrivalTime,
        Integer distanceKm
) {
}
