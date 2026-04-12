package com.trainbooking.trainservice.train.service;

import com.trainbooking.trainservice.exception.BusinessException;
import com.trainbooking.trainservice.mapper.TrainObjectMapper;
import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;
import com.trainbooking.trainservice.train.entity.Train;
import com.trainbooking.trainservice.train.entity.TrainSeatConfig;
import com.trainbooking.trainservice.train.repo.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainServiceImpl implements TrainService{

    private final TrainRepository trainRepository;

    @Override
    @Transactional
    public TrainResponse addTrain(TrainRequest request) {

        if (trainRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Train with code " + request.getCode() + " already exists", HttpStatus.CONFLICT.value());
        }

        Train train = new Train();
        train.setName(request.getName());
        train.setCode(request.getCode());
        train.setTrainType(request.getTrainType());

        List<TrainSeatConfig> trainSeatConfigs = request.getSeatConfigRequestList()
                .stream()
                .map(tc -> {
                    TrainSeatConfig seatConfig = new TrainSeatConfig();
                    seatConfig.setSeatClass(tc.getSeatClass());
                    seatConfig.setTotalSeats(tc.getTotalSeats());
                    seatConfig.setFarePerKm(tc.getFarePerKm());
                    seatConfig.setTrain(train);
                    return seatConfig;
                })
                .toList();

        train.setSeatConfigs(trainSeatConfigs);
        Train saved = trainRepository.save(train);

        return TrainObjectMapper.toResponse(train);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrainResponse> getAllTrains(Pageable pageable) {
        return trainRepository.findAll(pageable).map(TrainObjectMapper::toResponse);
    }
}
