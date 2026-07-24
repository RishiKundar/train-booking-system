package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.dto.SeatAvailabilityResponse;
import com.trainbooking.bookingservice.entity.SeatInventory;
import com.trainbooking.bookingservice.repo.SeatInventoryRepository;
import com.trainbooking.bookingservice.service.SeatAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class SeatAvailabilityServiceImpl implements SeatAvailabilityService {

    private final SeatInventoryRepository seatInventoryRepository;

    @Override
    public SeatAvailabilityResponse getAvailability(Long trainId, LocalDate travelDate) {
        List<SeatInventory> inventoryList =
                seatInventoryRepository.findByTrainIdAndTravelDate(trainId, travelDate);

        // Build a map: seatClass → availableSeats
        Map<String, Integer> availabilityByClass = inventoryList.stream()
                .collect(Collectors.toMap(
                        SeatInventory::getSeatClass,
                        SeatInventory::getAvailableSeats
                ));

        return new SeatAvailabilityResponse(trainId, travelDate, availabilityByClass);
    }
}
