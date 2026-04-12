package com.trainbooking.trainservice.train.controller;

import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;
import com.trainbooking.trainservice.train.service.TrainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/train/trains")
@RequiredArgsConstructor
@Tag(name = "Trains", description = "Manage train master data. Write operations require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class TrainController {

    private final TrainService trainService;

    @PostMapping
    @Operation(
        summary = "Add a new train",
        description = "Creates a new train along with its seat class configurations (SLEEPER, AC_3_TIER, AC_2_TIER, AC_FIRST_CLASS). Requires ADMIN role."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Train created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed — missing or invalid fields"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required"),
        @ApiResponse(responseCode = "409", description = "Conflict — train with this code already exists")
    })
    public ResponseEntity<TrainResponse> addTrain(@Valid @RequestBody TrainRequest request) {
        return ResponseEntity.ok(trainService.addTrain(request));
    }

    @GetMapping
    @Operation(
        summary = "Get all trains",
        description = "Returns all trains with their full seat class configurations including fare per km."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of trains returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid")
    })
    public ResponseEntity<Page<TrainResponse>> getAllTrains(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {
        Pageable pageable = PageRequest.of(page,size);

        return ResponseEntity.ok(trainService.getAllTrains(pageable));
    }
}
