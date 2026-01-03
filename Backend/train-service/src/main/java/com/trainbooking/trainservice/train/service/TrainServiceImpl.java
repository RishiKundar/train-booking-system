package com.trainbooking.trainservice.train.service;

import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;
import com.trainbooking.trainservice.train.entity.Train;
import com.trainbooking.trainservice.train.repo.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainServiceImpl implements TrainService{

    private final TrainRepository trainRepository;

    @Override
    public TrainResponse addTrain(TrainRequest request) {

        if (trainRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Train with code already exists");
        }

        Train train = new Train();
        train.setName(request.getName());
        train.setCode(request.getCode());
        train.setTrainType(request.getTrainType());
        train.setTotalSeats(request.getTotalSeats());

        Train saved = trainRepository.save(train);

        return new TrainResponse(
                saved.getId(),
                saved.getName(),
                saved.getCode(),
                saved.getTrainType(),
                saved.getTotalSeats()
        );
    }

    @Override
    public List<TrainResponse> getAllTrains() {
        return trainRepository.findAll()
                .stream()
                .map(t -> new TrainResponse(
                        t.getId(),
                        t.getName(),
                        t.getCode(),
                        t.getTrainType(),
                        t.getTotalSeats()
                ))
                .toList();
    }
}
