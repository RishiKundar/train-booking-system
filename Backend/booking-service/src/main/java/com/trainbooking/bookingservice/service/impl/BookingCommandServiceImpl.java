package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.dto.CreateBookingRequest;
import com.trainbooking.bookingservice.entity.Booking;
import com.trainbooking.bookingservice.entity.BookingStatus;
import com.trainbooking.bookingservice.entity.SeatInventory;
import com.trainbooking.bookingservice.exception.InsufficientSeatsException;
import com.trainbooking.bookingservice.repo.BookingRepository;
import com.trainbooking.bookingservice.repo.SeatInventoryRepository;
import com.trainbooking.bookingservice.service.BookingCommandService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingCommandServiceImpl implements BookingCommandService {

    private final SeatInventoryRepository seatInventoryRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    @Override
    public UUID createBooking(UUID userId, CreateBookingRequest createBookingRequest) {
        log.info("Inside Create Booking -> userId: {} Train ID: {} Seats: {}", userId,createBookingRequest.trainId(),createBookingRequest.seats());
        SeatInventory seatInventory = seatInventoryRepository.findForUpdate(createBookingRequest.trainId(),createBookingRequest.travelDate())
                .orElseThrow(() -> new RuntimeException("Seat Inventory Not Found"));


        if(seatInventory.getAvailableSeats() < createBookingRequest.seats()){
            throw new InsufficientSeatsException("Not Enough seats Available");
        }

        seatInventory.setAvailableSeats(seatInventory.getAvailableSeats() - createBookingRequest.seats());

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setUserId(userId);
        booking.setTrainId(createBookingRequest.trainId());
        booking.setSourceStationId(createBookingRequest.sourceStationId());
        booking.setDestinationStationId(createBookingRequest.destinationStationId());
        booking.setTravelDate(createBookingRequest.travelDate());
        booking.setSeatsBooked(createBookingRequest.seats());
        booking.setStatus(BookingStatus.BOOKED);

        bookingRepository.save(booking);
        log.info("Booking Confirmed -> booking_id:{} ", booking.getId().toString());
        return booking.getId();
    }
}
