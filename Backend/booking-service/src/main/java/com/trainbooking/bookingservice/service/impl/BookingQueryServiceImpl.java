package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.clients.TrainServiceClient;
import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.dto.EnrichedBookingResponse;
import com.trainbooking.bookingservice.entity.Booking;
import com.trainbooking.bookingservice.entity.BookingStatus;
import com.trainbooking.bookingservice.exception.BusinessException;
import com.trainbooking.bookingservice.repo.BookingRepository;
import com.trainbooking.bookingservice.service.BookingQueryService;
import com.trainbooking.bookingservice.util.ObjectMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;


@Service
@RequiredArgsConstructor
public class BookingQueryServiceImpl implements BookingQueryService {

    private final BookingRepository bookingRepository;
    private final TrainServiceClient trainServiceClient;

    @Override
    public Page<BookingResponse> getBookingForUser(UUID userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId,pageable).map(ObjectMapping::toResponse);
    }

    @Override
    public BookingResponse getBookingByPnr(String pnr, UUID userId) {

        Booking booking = bookingRepository.findByPnrAndUserId(pnr,userId)
                .orElseThrow(() -> new BusinessException("Booking not found with PNR " + pnr));

        return ObjectMapping.toResponse(booking);
    }

    @Override
    public Page<EnrichedBookingResponse> getEnrichedBookingsForUser(UUID userId, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByUserId(userId,pageable);

        return bookings.map(
                booking -> {
                    boolean isUpcoming = false;
                    if (booking.getStatus() == BookingStatus.CONFIRMED && booking.getTravelDate() != null) {
                        isUpcoming = booking.getTravelDate().isAfter(LocalDate.now().minusDays(1));
                    }
                    
                    try {
                        var enrichment = trainServiceClient.getEnrichmentData(
                                booking.getTrainId(),
                                booking.getSourceStationId(),
                                booking.getDestinationStationId());

                        return new EnrichedBookingResponse(
                                booking.getId(), booking.getPnr(),
                                enrichment.trainName(), enrichment.trainCode(), enrichment.trainType(),
                                enrichment.sourceName(), enrichment.sourceCity(),
                                enrichment.destName(), enrichment.destCity(),
                                booking.getTravelDate(), enrichment.departureTime(), enrichment.arrivalTime(),
                                enrichment.distanceKm(), booking.getSeatClass(), booking.getSeatsBooked(),
                                booking.getFare(), booking.getStatus(), isUpcoming
                        );
                    } catch (Exception e) {
                        // Fallback gracefully if enrichment fails (e.g. invalid station ID or train service down)
                        return new EnrichedBookingResponse(
                                booking.getId(), booking.getPnr(),
                                "Train #" + booking.getTrainId(), "UNK", "UNKNOWN",
                                "Station #" + booking.getSourceStationId(), "Unknown",
                                "Station #" + booking.getDestinationStationId(), "Unknown",
                                booking.getTravelDate(), java.time.LocalTime.of(0, 0), java.time.LocalTime.of(0, 0),
                                0, booking.getSeatClass(), booking.getSeatsBooked(),
                                booking.getFare(), booking.getStatus(), isUpcoming
                        );
                    }
                }
        );
    }
}
