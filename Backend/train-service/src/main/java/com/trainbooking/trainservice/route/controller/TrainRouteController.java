package com.trainbooking.trainservice.route.controller;


import com.trainbooking.trainservice.route.dto.TrainRouteRequest;
import com.trainbooking.trainservice.route.dto.TrainRouteResponse;
import com.trainbooking.trainservice.route.dto.TrainSearchResponse;
import com.trainbooking.trainservice.route.service.TrainRouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/train/routes")
@RequiredArgsConstructor
public class TrainRouteController {

    private final TrainRouteService trainRouteService;

    @PostMapping
    public ResponseEntity<TrainRouteResponse> addRoute(@Valid @RequestBody TrainRouteRequest trainRouteRequest){
        return ResponseEntity.ok(trainRouteService.addRoute(trainRouteRequest));
    }

    @GetMapping("/train-route/{trainId}")
    public ResponseEntity<List<TrainRouteResponse>> getRoutes(@PathVariable Long trainId){
        return ResponseEntity.ok(trainRouteService.getRoutesByTrain(trainId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TrainSearchResponse>> searchTrains(
            @RequestParam("sourceStationId") Long sourceStationId,
            @RequestParam("destinationStationId") Long destinationStationId
    ){
        return ResponseEntity.ok(trainRouteService.searchTrains(sourceStationId,destinationStationId));
    }
}
