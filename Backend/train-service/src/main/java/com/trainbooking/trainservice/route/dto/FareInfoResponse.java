package com.trainbooking.trainservice.route.dto;

import java.math.BigDecimal;

public record FareInfoResponse(
        Long trainId,
        Integer distanceKm,
        BigDecimal farePerKm
) {
}
