package com.trainbooking.trainservice.route.entity;

import com.trainbooking.trainservice.station.entity.Station;
import com.trainbooking.trainservice.train.entity.Train;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalTime;

@Entity
@Getter
@Setter
@Table(name = "train_routes", schema = "train_service")
public class TrainRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "train_id")
    private Train train;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    private Integer stopOrder;
    @Column(name = "arrival_time", columnDefinition = "TIME")
    private LocalTime arrivalTime;

    @Column(name = "departure_time", columnDefinition = "TIME")
    private LocalTime departureTime;
    private Integer distanceFromSource;
}
