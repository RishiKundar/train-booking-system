package com.trainbooking.paymentservice.dto;

import java.util.UUID;

public record CreateOrderResponse(
        UUID bookingId,
        String razorpayOrderId,
        Long amount,
        String currency,
        String keyId
) {
}
