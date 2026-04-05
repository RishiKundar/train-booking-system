package com.trainbooking.bookingservice.repo;


import com.trainbooking.bookingservice.entity.SeatInventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface SeatInventoryRepository extends JpaRepository<SeatInventory, Long> {

    Optional<SeatInventory> findByTrainIdAndTravelDate(Long trainId, LocalDate travelDate);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
          SELECT s from SeatInventory s 
                    where s.trainId = :trainId 
                    and s.travelDate = :travelDate
                    and s.seatClass = :seatClass
           """ )
    Optional<SeatInventory> findForUpdate(
            @Param("trainId") Long trainId,
            @Param("travelDate") LocalDate travelDate,
            @Param("seatClass") String seatClass
            );
}
