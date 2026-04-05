package com.trainbooking.trainservice.train.dto;

import com.trainbooking.trainservice.train.entity.SeatClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class TrainResponse {

    private Long id;
    private String name;
    private String code;
    private String trainType;
    private List<SeatConfigResponse> seatConfigResponseList;


    @Getter
    @Builder
    public static class SeatConfigResponse{
        private SeatClass seatClass;
        private Integer totalSeats;
        private BigDecimal fairPerKm;
    }
}