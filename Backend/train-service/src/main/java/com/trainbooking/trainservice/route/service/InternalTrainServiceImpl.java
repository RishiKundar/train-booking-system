package com.trainbooking.trainservice.route.service;

import com.trainbooking.trainservice.exception.BusinessException;
import com.trainbooking.trainservice.route.dto.FareInfoResponse;
import com.trainbooking.trainservice.route.dto.TrainEnrichmentResponse;
import com.trainbooking.trainservice.route.entity.TrainRoute;
import com.trainbooking.trainservice.route.repo.TrainRouteRepository;
import com.trainbooking.trainservice.station.entity.Station;
import com.trainbooking.trainservice.station.repo.StationRepository;
import com.trainbooking.trainservice.train.entity.SeatClass;
import com.trainbooking.trainservice.train.entity.Train;
import com.trainbooking.trainservice.train.entity.TrainSeatConfig;
import com.trainbooking.trainservice.train.repo.TrainRepository;
import com.trainbooking.trainservice.train.repo.TrainSeatConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class InternalTrainServiceImpl implements InternalTrainService{

    private final TrainRouteRepository trainRouteRepository;
    private final TrainSeatConfigRepository trainSeatConfigRepository;
    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;


    @Override
    public FareInfoResponse getFairInfo(Long trainId,
                                        Long sourceStationId,
                                        Long destinationStationId,
                                        String seatClass) {

        TrainRoute sourceRoute =  trainRouteRepository.findByTrainIdAndStationId(trainId,sourceStationId)
                .orElseThrow(() -> new BusinessException("Source Station not on this route", HttpStatus.NOT_FOUND.value()));

        TrainRoute destinationRoute = trainRouteRepository.findByTrainIdAndStationId(trainId,destinationStationId)
                .orElseThrow(() -> new BusinessException("Destination Station not on this route", HttpStatus.NOT_FOUND.value()));

        int distanceInKm = destinationRoute.getDistanceFromSource() - sourceRoute.getDistanceFromSource();

        if (distanceInKm <= 0) {
            throw new BusinessException("Destination must be after source on this route", HttpStatus.BAD_REQUEST.value());
        }

        TrainSeatConfig trainSeatConfig = trainSeatConfigRepository.findByTrainIdAndSeatClass(trainId, SeatClass.valueOf(seatClass))
                .orElseThrow(() -> new BusinessException("Seat class not available on this train", HttpStatus.NOT_FOUND.value()));


        return new FareInfoResponse(trainId,distanceInKm,trainSeatConfig.getFarePerKm());
    }

    @Override
    public TrainEnrichmentResponse getEnrichmentData(Long trainId, Long sourceId, Long destId) {
        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train Not Found"));
        Station source = stationRepository.findById(sourceId)
                .orElseThrow(() -> new RuntimeException("Source Station Not Found"));
        Station dest = stationRepository.findById(destId)
                .orElseThrow(() -> new RuntimeException("Destination Station Not Found"));

        TrainRoute sourceRoute = trainRouteRepository.findByTrainIdAndStationId(trainId,sourceId)
                .orElseThrow(() -> new RuntimeException("Source Route not found"));
        TrainRoute destRoute = trainRouteRepository.findByTrainIdAndStationId(trainId,destId)
                .orElseThrow(() -> new RuntimeException("Destination Route Not Found"));

        int distance = Math.abs(destRoute.getDistanceFromSource() - sourceRoute.getDistanceFromSource());

        return new TrainEnrichmentResponse(
                train.getName(),
                train.getCode(),
                train.getTrainType(),
                source.getName(),
                source.getCity(),
                dest.getName(),
                dest.getCity(),
                sourceRoute.getDepartureTime(),
                destRoute.getArrivalTime(),
                distance
        );
    }
}
