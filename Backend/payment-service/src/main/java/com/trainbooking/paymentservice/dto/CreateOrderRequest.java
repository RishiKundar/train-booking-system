package com.trainbooking.paymentservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateOrderRequest(
        @NotNull(message = "Booking Id is required")
        UUID bookingId,

        @NotNull(message = "Amount is required")
        Long amountInPaise

) {
}
