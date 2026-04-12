package com.trainbooking.bookingservice.service.impl;

import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.entity.Booking;
import com.trainbooking.bookingservice.exception.BusinessException;
import com.trainbooking.bookingservice.repo.BookingRepository;
import com.trainbooking.bookingservice.service.BookingQueryService;
import com.trainbooking.bookingservice.util.ObjectMapping;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;


@Service
@RequiredArgsConstructor
public class BookingQueryServiceImpl implements BookingQueryService {

    private final BookingRepository bookingRepository;

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
}
