package com.trainbooking.trainservice.route.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class TrainRouteResponse {

    private Long id;
    private Long trainId;
    private Long stationId;
    private Integer stopOrder;
    private LocalTime arrivalTime;
    private LocalTime departureTime;
    private Integer distanceFromSource;

}
