package com.trainbooking.trainservice.train.repo;

import com.trainbooking.trainservice.train.entity.Train;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainRepository extends JpaRepository<Train, Long> {

    Optional<Train> findByCode(String code);

    boolean existsByCode(String code);


}
