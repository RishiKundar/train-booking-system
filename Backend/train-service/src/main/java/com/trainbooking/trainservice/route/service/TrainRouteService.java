package com.trainbooking.trainservice.route.service;

import com.trainbooking.trainservice.route.dto.TrainRouteRequest;
import com.trainbooking.trainservice.route.dto.TrainRouteResponse;
import com.trainbooking.trainservice.route.dto.TrainSearchResponse;

import java.util.List;

public interface TrainRouteService {

    TrainRouteResponse addRoute(TrainRouteRequest trainRouteRequest);

    List<TrainRouteResponse> getRoutesByTrain(Long trainId);

    List<TrainSearchResponse> searchTrains(Long sourceStationId, Long destinationStationId);
}
