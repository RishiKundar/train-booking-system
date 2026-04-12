package com.trainbooking.trainservice.route.controller;

import com.trainbooking.trainservice.route.dto.TrainRouteRequest;
import com.trainbooking.trainservice.route.dto.TrainRouteResponse;
import com.trainbooking.trainservice.route.dto.TrainSearchResponse;
import com.trainbooking.trainservice.route.service.TrainRouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/train/routes")
@RequiredArgsConstructor
@Tag(name = "Train Routes", description = "Manage train route stops and search for available trains between stations.")
@SecurityRequirement(name = "bearerAuth")
public class TrainRouteController {

    private final TrainRouteService trainRouteService;

    @PostMapping
    @Operation(
        summary = "Add a route stop to a train",
        description = "Adds a single stop to a train's route with arrival/departure time and distance from source. Stop order must be unique per train. Requires ADMIN role."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Route stop added successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed or duplicate stop order"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Train or station not found")
    })
    public ResponseEntity<TrainRouteResponse> addRoute(@Valid @RequestBody TrainRouteRequest trainRouteRequest) {
        return ResponseEntity.ok(trainRouteService.addRoute(trainRouteRequest));
    }

    @GetMapping("/train-route/{trainId}")
    @Operation(
        summary = "Get all stops for a train",
        description = "Returns the complete ordered route of a train — all stations it passes through with arrival and departure times."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Route stops returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "404", description = "Train not found")
    })
    public ResponseEntity<Page<TrainRouteResponse>> getRoutes(
            @Parameter(description = "ID of the train", example = "1")
            @PathVariable Long trainId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page,size);

        return ResponseEntity.ok(trainRouteService.getRoutesByTrain(trainId,pageable));
    }

    @GetMapping("/search")
    @Operation(
        summary = "Search trains between two stations",
        description = "Finds all trains that have both the source and destination stations on their route, with the source appearing before the destination. Use GET /train/stations to get station IDs."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Matching trains returned successfully"),
        @ApiResponse(responseCode = "400", description = "Missing or invalid station IDs"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid")
    })
    public ResponseEntity<Page<TrainSearchResponse>> searchTrains(
            @Parameter(description = "ID of the source (departure) station", example = "1")
            @RequestParam("sourceStationId") Long sourceStationId,
            @Parameter(description = "ID of the destination (arrival) station", example = "4")
            @RequestParam("destinationStationId") Long destinationStationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page,size);
        return ResponseEntity.ok(trainRouteService.searchTrains(sourceStationId, destinationStationId,pageable));
    }
}
