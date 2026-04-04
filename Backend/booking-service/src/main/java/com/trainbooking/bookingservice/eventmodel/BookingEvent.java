package com.trainbooking.bookingservice.eventmodel;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;


@Data
@AllArgsConstructor
public class BookingEvent {

    private UUID bookingId;
    private UUID userId;
    private Long trainId;
    private Long sourceStationId;
    private Long destinationStationId;
    private Integer seats;
    private LocalDate travelDate;

}
