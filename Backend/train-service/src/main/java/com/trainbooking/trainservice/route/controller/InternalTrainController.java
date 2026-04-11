package com.trainbooking.trainservice.route.controller;


import com.trainbooking.trainservice.route.dto.FareInfoResponse;
import com.trainbooking.trainservice.route.repo.TrainRouteRepository;
import com.trainbooking.trainservice.route.service.InternalTrainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/train/internal")
@RequiredArgsConstructor
@Tag(name = "Internal Train service", description = "To fetch fare info for train")
public class InternalTrainController {

    private final InternalTrainService internalTrainService;

    @Operation(summary = "Get Fare Info", description = "To fetch fare info for train")
    @ApiResponse(responseCode = "200", description = "Fair response fetched successfully")
    @ApiResponse(responseCode = "500", description = "Something went wrong")
    @GetMapping("/fare-info")
    public ResponseEntity<FareInfoResponse> getFairInfo(
          @RequestParam("trainId") String trainIdStr,
          @RequestParam("sourceStationId") String sourceStationIdStr,
          @RequestParam("destinationStationId") String destinationStationIdStr,
          @RequestParam("seatClass") String seatClassStr
    ){
        Long trainId = Long.valueOf(trainIdStr);
        Long sourceId = Long.valueOf(sourceStationIdStr);
        Long destinationId = Long.valueOf(destinationStationIdStr);

        return ResponseEntity.ok(internalTrainService.getFairInfo(trainId,sourceId,destinationId,seatClassStr));
    }


}
