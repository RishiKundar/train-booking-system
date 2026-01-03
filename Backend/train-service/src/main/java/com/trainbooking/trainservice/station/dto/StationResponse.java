package com.trainbooking.trainservice.station.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class StationResponse {

    private Long id;
    private String name;
    private String code;
    private String city;
    private String state;
}
