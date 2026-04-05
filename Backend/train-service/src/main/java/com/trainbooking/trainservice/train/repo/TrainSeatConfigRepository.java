package com.trainbooking.trainservice.train.repo;

import com.trainbooking.trainservice.train.entity.SeatClass;
import com.trainbooking.trainservice.train.entity.TrainSeatConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainSeatConfigRepository extends JpaRepository<TrainSeatConfig, Long> {

    Optional<TrainSeatConfig> findByTrainIdAndSeatClass(Long trainId, SeatClass seatClass);
}
