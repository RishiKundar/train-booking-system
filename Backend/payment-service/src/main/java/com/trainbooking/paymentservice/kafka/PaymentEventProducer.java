package com.trainbooking.paymentservice.kafka;


import com.trainbooking.paymentservice.eventmodel.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    public static final String TOPIC = "payment-events";

    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    public void publish(PaymentEvent paymentEvent){
        kafkaTemplate.send(TOPIC, paymentEvent.getBookingId().toString(), paymentEvent);
        log.info("Published payment event -> bookingId : {} | status : {}", paymentEvent.getBookingId(), paymentEvent.getStatus());
    }
}
