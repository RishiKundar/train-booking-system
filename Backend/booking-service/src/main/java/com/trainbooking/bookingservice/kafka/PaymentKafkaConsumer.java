package com.trainbooking.bookingservice.kafka;


import com.trainbooking.bookingservice.eventmodel.PaymentEvent;
import com.trainbooking.bookingservice.service.BookingCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PaymentKafkaConsumer {

    private final BookingCommandService bookingCommandService;


    @KafkaListener(
            topics = "payment-events",
            groupId = "booking-payment-group",
            containerFactory = "paymentKafkaListnerFactory"
    )
    public void consume(PaymentEvent paymentEvent){
        log.info("Received Payment event -> bookingId : {} | status : {} ", paymentEvent.getBookingId(), paymentEvent.getStatus());

        if("CAPTURED".equals(paymentEvent.getStatus())){
            bookingCommandService.confirmBookingAfterPayment(paymentEvent.getBookingId());
        } else if ("FAILED".equals(paymentEvent.getStatus())) {
            bookingCommandService.handlePaymentFailure(paymentEvent.getBookingId());
        }

    }
}
