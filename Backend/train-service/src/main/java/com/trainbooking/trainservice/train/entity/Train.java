package com.trainbooking.trainservice.train.entity;


import com.trainbooking.trainservice.common.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trains", schema = "train_service")
@Getter
@Setter
public class Train extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "train_type", nullable = false, length = 50)
    private String trainType;

    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TrainSeatConfig> seatConfigs = new ArrayList<>();



}
