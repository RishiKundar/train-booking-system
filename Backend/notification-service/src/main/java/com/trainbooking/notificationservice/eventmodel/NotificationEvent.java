package com.trainbooking.notificationservice.eventmodel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
