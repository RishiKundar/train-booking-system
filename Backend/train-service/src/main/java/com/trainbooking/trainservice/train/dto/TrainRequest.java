package com.trainbooking.trainservice.train.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrainRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotBlank
    private String trainType;

    @NotNull
    private Integer totalSeats;
}