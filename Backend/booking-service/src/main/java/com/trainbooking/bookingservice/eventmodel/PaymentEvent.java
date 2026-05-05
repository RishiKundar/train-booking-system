package com.trainbooking.bookingservice.eventmodel;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaymentEvent {

    private UUID bookingId;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String status;
}
