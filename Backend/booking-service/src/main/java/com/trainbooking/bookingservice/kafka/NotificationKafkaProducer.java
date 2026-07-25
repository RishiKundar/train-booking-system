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

    private final KafkaTemplate<String, NotificationEvent> notificationEventKafkaTemplate;

    public void publish(NotificationEvent notificationEvent){
        log.info("Publishing NotificationEvent for BookingId: {} Status: {}", notificationEvent.getBookingId(), notificationEvent.getStatus());
        notificationEventKafkaTemplate.send(TOPIC,notificationEvent.getBookingId().toString(),notificationEvent);
    }

}
