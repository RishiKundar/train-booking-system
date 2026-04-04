package com.trainbooking.bookingservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "seat_inventory", schema = "booking_service")
@Getter
@Setter
public class SeatInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "train_id", nullable = false)
    private Long trainId;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Version
    private Long version;
}
