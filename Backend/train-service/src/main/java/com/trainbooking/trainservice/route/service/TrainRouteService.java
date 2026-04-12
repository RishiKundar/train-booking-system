package com.trainbooking.trainservice.route.service;

import com.trainbooking.trainservice.route.dto.TrainRouteRequest;
import com.trainbooking.trainservice.route.dto.TrainRouteResponse;
import com.trainbooking.trainservice.route.dto.TrainSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TrainRouteService {

    TrainRouteResponse addRoute(TrainRouteRequest trainRouteRequest);

    Page<TrainRouteResponse> getRoutesByTrain(Long trainId, Pageable pageable);

    Page<TrainSearchResponse> searchTrains(Long sourceStationId, Long destinationStationId, Pageable pageable);
}
