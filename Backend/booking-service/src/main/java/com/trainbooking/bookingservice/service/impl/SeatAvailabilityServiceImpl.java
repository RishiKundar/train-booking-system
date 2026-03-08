package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.dto.SeatAvailabilityResponse;
import com.trainbooking.bookingservice.repo.SeatInventoryRepository;
import com.trainbooking.bookingservice.service.SeatAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;


@Service
@RequiredArgsConstructor
public class SeatAvailabilityServiceImpl implements SeatAvailabilityService {

    private final SeatInventoryRepository seatInventoryRepository;

    @Override
    public SeatAvailabilityResponse getAvailability(Long trainId, LocalDate travelDate) {
        return seatInventoryRepository.findByTrainIdAndTravelDate(trainId,travelDate)
                .map(inv -> new SeatAvailabilityResponse(
                        trainId,
                        travelDate,
                        inv.getAvailableSeats()
                )).orElse( new SeatAvailabilityResponse(
                        trainId,
                        travelDate,
                        0
                ));
    }
}
