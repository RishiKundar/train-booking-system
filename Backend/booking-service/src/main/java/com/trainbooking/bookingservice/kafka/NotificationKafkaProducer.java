package com.trainbooking.bookingservice.kafka;

import com.trainbooking.bookingservice.eventmodel.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;


@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationKafkaProducer {

    private static final String TOPIC = "notification-events";

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void publish(NotificationEvent notificationEvent){
        try {
            log.info("Publishing NotificationEvent for BookingId: {} Status: {}", notificationEvent.getBookingId(), notificationEvent.getStatus());
            kafkaTemplate.send(TOPIC, notificationEvent.getBookingId().toString(), notificationEvent);
        } catch (Exception e) {
            log.error("Failed to publish notification event to Kafka: {}", e.getMessage(), e);
        }
    }

}
