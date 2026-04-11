package com.trainbooking.bookingservice.util;

import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.entity.Booking;

public class ObjectMapping {

    public static BookingResponse toResponse(Booking booking){
        return new BookingResponse(
                booking.getId(),
                booking.getTrainId(),
                booking.getTravelDate(),
                booking.getSeatsBooked(),
                booking.getStatus(),
                booking.getSeatClass(),
                booking.getFare(),
                booking.getSourceStationId(),
                booking.getDestinationStationId(),
                booking.getPnr()
        );
    }

}
