package com.trainbooking.trainservice.route.controller;


import com.trainbooking.trainservice.route.dto.FareInfoResponse;
import com.trainbooking.trainservice.route.repo.TrainRouteRepository;
import com.trainbooking.trainservice.route.service.InternalTrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/train/internal")
@RequiredArgsConstructor
public class InternalTrainController {

    private final InternalTrainService internalTrainService;

    @GetMapping("/fare-info")
    public ResponseEntity<FareInfoResponse> getFairInfo(
            @RequestParam("trainId") Long trainId,
            @RequestParam("sourceId") Long sourceId,
            @RequestParam("destinationId") Long destinationId,
            @RequestParam("seatClass") String seatClass
    ){
        return ResponseEntity.ok(internalTrainService.getFairInfo(trainId,sourceId,destinationId,seatClass));
    }


}
