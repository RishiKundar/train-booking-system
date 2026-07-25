package com.trainbooking.bookingservice.eventmodel;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {

    private UUID bookingId;
    private UUID userId;
    private String pnr;
    private Long trainId;
    private LocalDate travelDate;
    private Integer seats;
    private BigDecimal fare;
    private String status;
}
