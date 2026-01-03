package com.trainbooking.trainservice.route.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class TrainRouteRequest {

    @NotNull
    private Long trainId;

    @NotNull
    private Long stationId;

    @NotNull
    private Integer stopOrder;

    private LocalTime arrivalTime;

    private LocalTime departureTime;

    private Integer distanceFromSource;
}
