package com.trainbooking.trainservice.route.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.cglib.core.Local;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class TrainSearchResponse {

    private Long trainId;
    private String trainName;
    private String trainCode;

    private Long sourceStationId;
    private LocalTime sourceDepartureTime;

    private Long destinationStationId;
    private LocalTime destinationArrivalTime;
}
