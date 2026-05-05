package com.trainbooking.paymentservice.eventmodel;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {

    private UUID bookingId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String status;
}
