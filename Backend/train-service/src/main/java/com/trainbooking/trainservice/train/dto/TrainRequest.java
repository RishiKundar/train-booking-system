package com.trainbooking.trainservice.train.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.trainbooking.trainservice.train.entity.SeatClass;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainRequest {

    @NotBlank(message = "Train Name is Required")
    private String name;

    @NotBlank(message = "Train Code is Required")
    private String code;

    @NotBlank(message = "Train type is required")
    private String trainType;

    @Valid
    @NotEmpty(message = "At least one seat class is required")
    private List<SeatConfigRequest> seatConfigRequestList;


    @Getter
    @Setter
    @NoArgsConstructor
    public static class SeatConfigRequest{

        @NotNull(message = "Seat Class is required")
        private SeatClass seatClass;

        @NotNull(message = "Total Seats must be at least 1")
        private Integer totalSeats;

        @NotNull @DecimalMin(value = "0.1", message = "Fare per km must be positive")
        private BigDecimal farePerKm;
    }
}