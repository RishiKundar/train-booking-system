package com.trainbooking.trainservice.station.service;

import com.trainbooking.trainservice.station.dto.StationRequest;
import com.trainbooking.trainservice.station.dto.StationResponse;
import com.trainbooking.trainservice.station.entity.Station;
import com.trainbooking.trainservice.station.repo.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService{

    private final StationRepository stationRepository;

    @Override
    public StationResponse addStation(StationRequest stationRequest) {

        if(stationRepository.existsByCode(stationRequest.getCode())){
            throw new RuntimeException("Station with code already exists");
        }

        Station station = new Station();
        station.setName(stationRequest.getName());
        station.setCode(stationRequest.getCode());
        station.setCity(stationRequest.getCity());
        station.setState(stationRequest.getState());

        Station saved = stationRepository.save(station);

        return new StationResponse(
                saved.getId(),
                saved.getName(),
                saved.getCode(),
                saved.getCity(),
                saved.getState()
        );
    }

    @Override
    public List<StationResponse> getAllStation() {
        return stationRepository.findAll()
                .stream()
                .map( s -> new StationResponse(
                        s.getId(),
                        s.getName(),
                        s.getCode(),
                        s.getCity(),
                        s.getState()
                ))
                .toList();
    }
}
