package com.trainbooking.trainservice.route.service;


import com.trainbooking.trainservice.route.dto.FareInfoResponse;
import com.trainbooking.trainservice.route.dto.TrainEnrichmentResponse;
import org.springframework.stereotype.Service;


public interface InternalTrainService {

    FareInfoResponse getFairInfo(Long trainId, Long sourceStationId, Long destinationStationId, String seatClass);

    TrainEnrichmentResponse getEnrichmentData(Long trainId, Long sourceId, Long destId);
}
