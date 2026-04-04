package com.trainbooking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "booking", schema = "booking_service")
@Getter
@Setter
public class Booking {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "train_id")
    private Long trainId;

    @Column(name = "source_station_id")
    private Long sourceStationId;

    @Column(name = "destination_station_id")
    private Long destinationStationId;

    @Column(name = "travel_date")
    private LocalDate travelDate;

    @Column(name = "seats_booked")
    private Integer seatsBooked;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;


}
