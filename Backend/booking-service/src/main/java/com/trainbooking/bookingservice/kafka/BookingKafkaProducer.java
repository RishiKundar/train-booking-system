package com.trainbooking.bookingservice.kafka;

import com.trainbooking.bookingservice.eventmodel.BookingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;


@Component
@Slf4j
@RequiredArgsConstructor
public class BookingKafkaProducer {


    public static final String TOPIC = "booking-events";
    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public void publish(BookingEvent bookingEvent){
        log.info("[{}] Publishing to Kafka -> bookingId : {} ", bookingEvent.getCorrelationId(), bookingEvent.getBookingId());
        kafkaTemplate.send(TOPIC,bookingEvent.getBookingId().toString(), bookingEvent);

    }
}
