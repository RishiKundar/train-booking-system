package com.trainbooking.trainservice.train.service;

import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TrainService {

    TrainResponse addTrain(TrainRequest request);

    Page<TrainResponse> getAllTrains(Pageable pageable);
}
