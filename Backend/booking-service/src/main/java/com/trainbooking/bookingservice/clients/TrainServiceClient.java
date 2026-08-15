package com.trainbooking.bookingservice.clients;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Slf4j
@Component
public class TrainServiceClient {

    private final RestClient restClient;

    public TrainServiceClient(@Value("${services.train.url}") String trainServiceURL){
        this.restClient = RestClient.builder().baseUrl(trainServiceURL).build();
    }

    public FareInfo getFareInfo(String trainId, String sourceId, String destinationId, String seatClass){
        return restClient.get().uri("/train/internal/fare-info?trainId={t}&sourceStationId={s}&destinationStationId={d}&seatClass={c}"
        ,trainId,sourceId,destinationId,seatClass).retrieve().body(FareInfo.class);
    }

    public TrainEnrichmentResponse getEnrichmentData(Long trainId, Long sourceId, Long destinationId){
        return restClient.get().uri("/train/internal/booking-enrichment?trainId={t}&sourceId={s}&destId={d}",trainId,sourceId,destinationId)
                .retrieve().body(TrainEnrichmentResponse.class);
    }

    public record FareInfo(Long trainId, Integer distanceKm, BigDecimal farePerKm){}

    public record TrainEnrichmentResponse(
            String trainName, String trainCode, String trainType,
            String sourceName, String sourceCity,
            String destName, String destCity,
            java.time.LocalTime departureTime, java.time.LocalTime arrivalTime,
            Integer distanceKm
    ) {}
}
