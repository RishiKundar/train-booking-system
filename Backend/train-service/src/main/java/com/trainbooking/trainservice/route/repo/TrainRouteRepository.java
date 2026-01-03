package com.trainbooking.trainservice.route.repo;

import com.trainbooking.trainservice.route.entity.TrainRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrainRouteRepository extends JpaRepository<TrainRoute, Long> {

    List<TrainRoute> findByTrainIdOrderByStopOrder(Long trainId);

    boolean existsByTrainIdAndStopOrder(Long trainId, Integer stopOrder);

    @Query("""
            SELECT r1.train.id, r1.train.name, r1.train.code,
            r1.station.id, r1.departureTime,
            r2.station.id, r2.arrivalTime 
            FROM TrainRoute r1 JOIN TrainRoute r2
            ON r1.train.id = r2.train.id
            WHERE r1.train.id = :sourceId
            AND r2.train.id = :destinationId
            AND r1.stopOrder < r2.stopOrder
            """)
    List<Object[]> searchTrains(@Param("sourceId") Long sourceId, @Param("destinationId") Long destinationId);
}
