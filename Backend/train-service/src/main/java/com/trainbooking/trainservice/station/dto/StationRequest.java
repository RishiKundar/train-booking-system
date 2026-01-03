package com.trainbooking.trainservice.station.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotBlank
    private String city;

    @NotBlank
    private String state;


}
