package com.trainbooking.bookingservice.repo;

import com.trainbooking.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserId(UUID userId);

    Optional<Booking> findByIdempotencyKey(String idempotencyKey);
}
