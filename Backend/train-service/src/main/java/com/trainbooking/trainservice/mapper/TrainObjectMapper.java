package com.trainbooking.trainservice.mapper;

import com.trainbooking.trainservice.train.dto.TrainResponse;
import com.trainbooking.trainservice.train.entity.Train;

import java.util.List;

public class TrainObjectMapper {

    public static TrainResponse toResponse(Train train){
        List<TrainResponse.SeatConfigResponse> seatConfigResponseList = train.getSeatConfigs()
                .stream()
                .map(sc -> TrainResponse.SeatConfigResponse.builder()
                        .seatClass(sc.getSeatClass())
                        .totalSeats(sc.getTotalSeats())
                        .fairPerKm(sc.getFarePerKm())
                        .build())
                .toList();

        return TrainResponse.builder()
                .id(train.getId())
                .name(train.getName())
                .code(train.getCode())
                .trainType(train.getTrainType())
                .seatConfigResponseList(seatConfigResponseList)
                .build();

    }
}
