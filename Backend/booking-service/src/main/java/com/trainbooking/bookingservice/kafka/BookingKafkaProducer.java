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
        try {
            log.info("[{}] Publishing to Kafka -> bookingId : {} ", bookingEvent.getCorrelationId(), bookingEvent.getBookingId());
            kafkaTemplate.send(TOPIC, bookingEvent.getBookingId().toString(), bookingEvent);
        } catch (Exception e) {
            log.error("Failed to publish booking event to Kafka: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Root cause: {}", e.getCause().getMessage(), e.getCause());
            }
        }
    }
}
