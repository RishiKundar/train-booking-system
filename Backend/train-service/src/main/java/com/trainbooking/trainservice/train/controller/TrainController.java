package com.trainbooking.trainservice.train.controller;

import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;
import com.trainbooking.trainservice.train.service.TrainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/train/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @PostMapping
    public ResponseEntity<TrainResponse> addTrain(
            @Valid @RequestBody TrainRequest request
    ) {
        return ResponseEntity.ok(trainService.addTrain(request));
    }

    @GetMapping
    public ResponseEntity<List<TrainResponse>> getAllTrains() {
        return ResponseEntity.ok(trainService.getAllTrains());
    }
}
