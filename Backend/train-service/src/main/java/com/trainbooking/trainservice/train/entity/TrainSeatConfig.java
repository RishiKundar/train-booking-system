package com.trainbooking.trainservice.train.entity;


import com.trainbooking.trainservice.common.Auditable;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "train_seat_configs", schema = "train_service")
@Data
public class TrainSeatConfig extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_class", nullable = false, length = 20)
    private SeatClass seatClass;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "fare_per_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal farePerKm;


}
