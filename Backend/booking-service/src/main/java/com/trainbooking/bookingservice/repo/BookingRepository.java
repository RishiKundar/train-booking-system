package com.trainbooking.bookingservice.repo;

import com.trainbooking.bookingservice.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    Optional<Booking> findByIdempotencyKey(String idempotencyKey);

    Optional<Booking> findByPnrAndUserId(String pnr, UUID userId);
}
