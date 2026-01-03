package com.trainbooking.trainservice.train.service;

import com.trainbooking.trainservice.train.dto.TrainRequest;
import com.trainbooking.trainservice.train.dto.TrainResponse;

import java.util.List;

public interface TrainService {

    TrainResponse addTrain(TrainRequest request);

    List<TrainResponse> getAllTrains();
}
