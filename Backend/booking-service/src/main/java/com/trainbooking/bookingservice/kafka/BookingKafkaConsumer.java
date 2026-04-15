package com.trainbooking.bookingservice.kafka;

import com.trainbooking.bookingservice.eventmodel.BookingEvent;
import com.trainbooking.bookingservice.service.BookingCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
@Slf4j
@RequiredArgsConstructor
public class BookingKafkaConsumer {

    private final BookingCommandService bookingCommandService;


    @KafkaListener(
            topics = BookingKafkaProducer.TOPIC,
            groupId = "booking-service-group"
    )
    public void consume(BookingEvent bookingEvent){
        if(bookingEvent.getCorrelationId() != null){
            MDC.put("correlationId", bookingEvent.getCorrelationId());
        }

        try{
            log.info("Consuming booking event --> bookingId: {}", bookingEvent.getBookingId());
            bookingCommandService.processBooking(bookingEvent);
        }finally {
            MDC.remove("correlationId");
        }
    }
}
