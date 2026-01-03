package com.trainbooking.trainservice.station.service;

import com.trainbooking.trainservice.station.dto.StationRequest;
import com.trainbooking.trainservice.station.dto.StationResponse;

import java.util.List;

public interface StationService {

    StationResponse addStation(StationRequest stationRequest);

    List<StationResponse> getAllStation();
}
