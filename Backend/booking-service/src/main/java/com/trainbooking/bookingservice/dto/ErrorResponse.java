package com.trainbooking.bookingservice.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Instant;

@Getter
@Builder
public class ErrorResponse {

    private int status;
    private String message;
    private String error;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp;
}
