package com.trainbooking.trainservice.station.entity;


import com.trainbooking.trainservice.common.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Table(name = "stations", schema = "train_service")
@Getter
@Setter
@Entity
public class Station extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;
    private String city;
    private String state;
}
