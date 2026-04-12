package com.trainbooking.trainservice.station.service;

import com.trainbooking.trainservice.station.dto.StationRequest;
import com.trainbooking.trainservice.station.dto.StationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StationService {

    StationResponse addStation(StationRequest stationRequest);

    Page<StationResponse> getAllStation(Pageable pageable);
}
