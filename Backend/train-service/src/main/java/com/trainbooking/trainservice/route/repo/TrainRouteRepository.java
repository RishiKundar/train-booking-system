package com.trainbooking.trainservice.route.repo;

import com.trainbooking.trainservice.route.entity.TrainRoute;
import com.trainbooking.trainservice.train.entity.Train;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrainRouteRepository extends JpaRepository<TrainRoute, Long> {

    Page<TrainRoute> findByTrainIdOrderByStopOrder(Long trainId, Pageable pageable);

    boolean existsByTrainIdAndStopOrder(Long trainId, Integer stopOrder);

    @Query("""
            SELECT r1.train.id, r1.train.name, r1.train.code,
                       r1.station.id, r1.departureTime,
                       r2.station.id, r2.arrivalTime
                FROM TrainRoute r1
                JOIN TrainRoute r2
                  ON r1.train.id = r2.train.id
                WHERE r1.station.id = :sourceId
                  AND r2.station.id = :destinationId
                  AND r1.stopOrder < r2.stopOrder
            """)
    Page<Object[]> searchTrains(@Param("sourceId") Long sourceId, @Param("destinationId") Long destinationId, Pageable pageable);

    Optional<TrainRoute> findByTrainIdAndStationId(Long trainId, Long stationId);
}
