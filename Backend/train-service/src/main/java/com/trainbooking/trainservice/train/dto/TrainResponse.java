package com.trainbooking.trainservice.train.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TrainResponse {

    private Long id;
    private String name;
    private String code;
    private String trainType;
    private Integer totalSeats;
}