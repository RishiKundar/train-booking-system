package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.clients.TrainServiceClient;
import com.trainbooking.bookingservice.dto.CreateBookingRequest;
import com.trainbooking.bookingservice.entity.Booking;
import com.trainbooking.bookingservice.entity.BookingStatus;
import com.trainbooking.bookingservice.entity.SeatInventory;
import com.trainbooking.bookingservice.event.BookingQueue;
import com.trainbooking.bookingservice.eventmodel.BookingEvent;
import com.trainbooking.bookingservice.exception.BookingException;
import com.trainbooking.bookingservice.exception.BookingFailedException;
import com.trainbooking.bookingservice.exception.BusinessException;
import com.trainbooking.bookingservice.exception.InsufficientSeatsException;

import com.trainbooking.bookingservice.repo.BookingRepository;
import com.trainbooking.bookingservice.repo.SeatInventoryRepository;
import com.trainbooking.bookingservice.service.BookingCommandService;
import com.trainbooking.bookingservice.util.PNRGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingCommandServiceImpl implements BookingCommandService {

    private final SeatInventoryRepository seatInventoryRepository;
    private final BookingRepository bookingRepository;
    private final BookingQueue bookingQueue;
    private final TrainServiceClient trainServiceClient;

    @Transactional
    @Override
    public UUID createBooking(UUID userId, CreateBookingRequest createBookingRequest) {
        log.info("Inside Create Booking -> userId: {} Train ID: {} Seats: {}", userId,createBookingRequest.trainId(),createBookingRequest.seats());
        SeatInventory seatInventory = seatInventoryRepository.findForUpdate(createBookingRequest.trainId(),createBookingRequest.travelDate(),createBookingRequest.seatClass())
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


    @Transactional
    public UUID bookSeats(UUID userId, CreateBookingRequest createBookingRequest){
        log.info("Inside Create Booking -> userId: {} Train ID: {} Seats: {}", userId,createBookingRequest.trainId(),createBookingRequest.seats());

        Optional<Booking> existingBooking = bookingRepository.findByIdempotencyKey(createBookingRequest.idempotencyKey());

        if(existingBooking.isPresent()){
            return existingBooking.get().getId();
        }

        SeatInventory seatInventory = seatInventoryRepository.findByTrainIdAndTravelDate(createBookingRequest.trainId(),createBookingRequest.travelDate()).orElseThrow(() -> new RuntimeException("Not able to Find Trains"));

        if(seatInventory.getAvailableSeats() < createBookingRequest.seats()){
            throw new InsufficientSeatsException("Not Enough seats Available");
        }

        seatInventory.setAvailableSeats(seatInventory.getAvailableSeats() - createBookingRequest.seats());
        seatInventoryRepository.save(seatInventory);

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setUserId(userId);
        booking.setTrainId(createBookingRequest.trainId());
        booking.setSourceStationId(createBookingRequest.sourceStationId());
        booking.setDestinationStationId(createBookingRequest.destinationStationId());
        booking.setTravelDate(createBookingRequest.travelDate());
        booking.setSeatsBooked(createBookingRequest.seats());
        booking.setStatus(BookingStatus.BOOKED);
        booking.setIdempotencyKey(createBookingRequest.idempotencyKey());

        bookingRepository.save(booking);
        log.info("Booking Confirmed -> booking_id:{} ", booking.getId().toString());
        return booking.getId();
    }


    @Override
    public UUID createBookingVersion2(UUID userId, CreateBookingRequest createBookingRequest) {
        int attempts = 0;

        while(attempts < 3){
            try{
                return bookSeats(userId,createBookingRequest);
            } catch (ObjectOptimisticLockingFailureException e) {
                attempts++;
                log.warn("Optimistic lock conflict. Attempt {}", attempts);
                try {
                    Thread.sleep(50 * attempts);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            } catch (DataIntegrityViolationException e) {
                Booking existing = bookingRepository
                        .findByIdempotencyKey(createBookingRequest.idempotencyKey())
                        .orElseThrow();

                return existing.getId();
            }
        }

        throw new BookingFailedException("Booking for Train is Failed");
    }

    @Override
    @Transactional
    public UUID createBookingAsync(UUID userId, CreateBookingRequest createBookingRequest) {

        UUID bookingId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setUserId(userId);
        booking.setIdempotencyKey(createBookingRequest.idempotencyKey());
        booking.setStatus(BookingStatus.PENDING);
        booking.setSeatClass(createBookingRequest.seatClass());
        bookingRepository.save(booking);

        String correlationId = MDC.get("correlationId");

        BookingEvent event = new BookingEvent(
                bookingId,
                userId,
                createBookingRequest.trainId(),
                createBookingRequest.sourceStationId(),
                createBookingRequest.destinationStationId(),
                createBookingRequest.seatClass(),
                createBookingRequest.seats(),
                createBookingRequest.travelDate(),
                correlationId
        );

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        bookingQueue.publish(event);
                        log.info("Inside Transactional Manager After Commit method with booking id -> {}", bookingId);
                    }
                }
        );

        return bookingId;
    }

    @Override
    @Transactional
    public void processBooking(BookingEvent bookingEvent) {

        if(bookingEvent.getCorrelationId() != null){
            MDC.put("correlationId", bookingEvent.getCorrelationId());
        }


        Booking booking = bookingRepository.findById(bookingEvent.getBookingId())
                .orElseThrow(() -> new BookingException("Booking ID is not available", HttpStatus.NOT_FOUND));

        try {
            log.info("Processing booking -> userId: {} trainId: {} seats: {}",
                    bookingEvent.getUserId(), bookingEvent.getTrainId(), bookingEvent.getSeats());

            TrainServiceClient.FareInfo fareInfo = trainServiceClient.getFareInfo(
                    bookingEvent.getTrainId().toString(),
                    bookingEvent.getSourceStationId().toString(),
                    bookingEvent.getDestinationStationId().toString(),
                    booking.getSeatClass()
            );

            SeatInventory seatInventory = seatInventoryRepository
                    .findForUpdate(bookingEvent.getTrainId(), bookingEvent.getTravelDate(),bookingEvent.getSeatClass())
                    .orElseThrow(() -> new BookingException("Seat inventory not found",HttpStatus.NOT_FOUND));

            if (seatInventory.getAvailableSeats() < bookingEvent.getSeats()) {
                throw new InsufficientSeatsException("Not Enough seats Available");
            }

            seatInventory.setAvailableSeats(seatInventory.getAvailableSeats() - bookingEvent.getSeats());

            BigDecimal fare = fareInfo.farePerKm()
                    .multiply(BigDecimal.valueOf(fareInfo.distanceKm()))
                    .multiply(BigDecimal.valueOf(bookingEvent.getSeats()));

            // 6. Update booking to CONFIRMED
            booking.setTrainId(bookingEvent.getTrainId());
            booking.setSourceStationId(bookingEvent.getSourceStationId());
            booking.setDestinationStationId(bookingEvent.getDestinationStationId());
            booking.setTravelDate(bookingEvent.getTravelDate());
            booking.setSeatsBooked(bookingEvent.getSeats());
            booking.setSeatClass(bookingEvent.getSeatClass());
            booking.setFare(fare);
            booking.setPnr(PNRGenerator.generatePnr(bookingEvent.getTravelDate()));
            booking.setStatus(BookingStatus.BOOKED);

            log.info("Booking confirmed -> bookingId: {}", booking.getId());
            log.debug("CorrelationId -> {}", bookingEvent.getCorrelationId());

        } catch (Exception e) {
            log.error("Booking processing failed for bookingId: {}", bookingEvent.getBookingId(), e);
            booking.setStatus(BookingStatus.FAILED);
        }finally {
            MDC.remove("correlationId");
            bookingRepository.save(booking);
        }
    }

    @Transactional
    @Override
    public void cancelBooking(String pnr, UUID userId) {
        Booking booking = bookingRepository.findByPnrAndUserId(pnr,userId)
                .orElseThrow(() -> new BusinessException("Booking not found with PNR : " + pnr));

        if(booking.getStatus() != BookingStatus.BOOKED){
            throw new BusinessException("Only Confirmed Booking can be cancelled. Current Booking status is " + booking.getStatus());
        }

        if(!booking.getTravelDate().isAfter(LocalDate.now())){
            throw new BusinessException("Cannot Cancel a booking for past or today's travel Date");
        }

        SeatInventory seatInventory = seatInventoryRepository.findForUpdate(booking.getTrainId(),booking.getTravelDate(),booking.getSeatClass())
                .orElseThrow(() -> new BusinessException("Seat Inventory cannot be found"));

        seatInventory.setAvailableSeats(seatInventory.getAvailableSeats() + booking.getSeatsBooked());

        booking.setStatus(BookingStatus.CANCELLED);

        bookingRepository.save(booking);
        seatInventoryRepository.save(seatInventory);

        log.info("Booking is cancelled -> PNR {}, seats restored {}", pnr, booking.getSeatsBooked());
    }

}
