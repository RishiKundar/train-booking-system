package com.trainbooking.trainservice.route.service;

import com.trainbooking.trainservice.route.dto.TrainRouteRequest;
import com.trainbooking.trainservice.route.dto.TrainRouteResponse;
import com.trainbooking.trainservice.route.dto.TrainSearchResponse;
import com.trainbooking.trainservice.route.entity.TrainRoute;
import com.trainbooking.trainservice.route.repo.TrainRouteRepository;
import com.trainbooking.trainservice.station.entity.Station;
import com.trainbooking.trainservice.station.repo.StationRepository;
import com.trainbooking.trainservice.train.entity.Train;
import com.trainbooking.trainservice.train.repo.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class TrainRouteServiceImpl implements TrainRouteService{

    private final TrainRouteRepository trainRouteRepository;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;

    @Override
    public TrainRouteResponse addRoute(TrainRouteRequest trainRouteRequest) {

        Train train = trainRepository.findById(trainRouteRequest.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        Station station = stationRepository.findById(trainRouteRequest.getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));

        if(trainRouteRepository.existsByTrainIdAndStopOrder(trainRouteRequest.getTrainId(),trainRouteRequest.getStopOrder())){
            throw new RuntimeException("Stop Order already exists for this train");
        }

        TrainRoute trainRoute = new TrainRoute();
        trainRoute.setTrain(train);
        trainRoute.setStation(station);
        trainRoute.setStopOrder(trainRouteRequest.getStopOrder());
        trainRoute.setArrivalTime(trainRouteRequest.getArrivalTime());
        trainRoute.setDepartureTime(trainRouteRequest.getDepartureTime());
        trainRoute.setDistanceFromSource(trainRouteRequest.getDistanceFromSource());

        TrainRoute route = trainRouteRepository.save(trainRoute);

        return new TrainRouteResponse(
                route.getId(),
                train.getId(),
                station.getId(),
                route.getStopOrder(),
                route.getArrivalTime(),
                route.getDepartureTime(),
                route.getDistanceFromSource()
        );
    }

    @Override
    public List<TrainRouteResponse> getRoutesByTrain(Long trainId) {
        return trainRouteRepository.findByTrainIdOrderByStopOrder(trainId)
                .stream()
                .map(route -> new TrainRouteResponse(
                        route.getId(),
                        route.getTrain().getId(),
                        route.getStation().getId(),
                        route.getStopOrder(),
                        route.getArrivalTime(),
                        route.getDepartureTime(),
                        route.getDistanceFromSource()
                ))
                .toList();
    }

    @Override
    public List<TrainSearchResponse> searchTrains(Long sourceStationId, Long destinationStationId) {
        return trainRouteRepository.searchTrains(sourceStationId,destinationStationId)
                .stream()
                .map( row -> new TrainSearchResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (Long) row[3],
                        (LocalTime) row[4],
                        (Long) row[5],
                        (LocalTime) row[6]
                )).toList();
    }
}
