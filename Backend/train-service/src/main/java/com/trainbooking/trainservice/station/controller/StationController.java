package com.trainbooking.trainservice.station.controller;


import com.trainbooking.trainservice.station.dto.StationRequest;
import com.trainbooking.trainservice.station.dto.StationResponse;
import com.trainbooking.trainservice.station.service.StationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;


    @PostMapping
    public ResponseEntity<StationResponse> addStation(@Valid @RequestBody StationRequest stationRequest){
        return ResponseEntity.ok(stationService.addStation(stationRequest));
    }

    @GetMapping
    public ResponseEntity<List<StationResponse>> getAllStation(){
        return ResponseEntity.ok(stationService.getAllStation());
    }

}
