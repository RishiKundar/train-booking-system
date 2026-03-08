package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.repo.BookingRepository;
import com.trainbooking.bookingservice.service.BookingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class BookingQueryServiceImpl implements BookingQueryService {

    private final BookingRepository bookingRepository;

    @Override
    public List<BookingResponse> getBookingForUser(UUID userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getTrainId(),
                        b.getTravelDate(),
                        b.getSeatsBooked(),
                        b.getStatus()
                ))
                .toList();
    }
}
