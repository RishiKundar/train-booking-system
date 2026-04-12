package com.trainbooking.trainservice.station.controller;

import com.trainbooking.trainservice.station.dto.StationRequest;
import com.trainbooking.trainservice.station.dto.StationResponse;
import com.trainbooking.trainservice.station.service.StationService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/train/stations")
@RequiredArgsConstructor
@Tag(name = "Stations", description = "Manage railway stations. Write operations require ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class StationController {

    private final StationService stationService;

    @PostMapping
    @Operation(
        summary = "Add a new station",
        description = "Creates a new railway station with its name, code, city, and state. Station code must be unique (e.g. BCT, NDLS). Requires ADMIN role."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Station created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed — missing or invalid fields"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required"),
        @ApiResponse(responseCode = "409", description = "Conflict — station with this code already exists")
    })
    public ResponseEntity<StationResponse> addStation(@Valid @RequestBody StationRequest stationRequest) {
        return ResponseEntity.ok(stationService.addStation(stationRequest));
    }

    @GetMapping
    @Operation(
        summary = "Get all stations",
        description = "Returns a list of all railway stations. Use station IDs from this list as sourceStationId and destinationStationId when searching trains."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of stations returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid")
    })
    public ResponseEntity<Page<StationResponse>> getAllStation(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page,size, Sort.by("name").ascending());
        return ResponseEntity.ok(stationService.getAllStation(pageable));
    }
}
