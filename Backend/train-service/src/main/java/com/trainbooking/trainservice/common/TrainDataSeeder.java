package com.trainbooking.trainservice.common;


import com.trainbooking.trainservice.route.entity.TrainRoute;
import com.trainbooking.trainservice.route.repo.TrainRouteRepository;
import com.trainbooking.trainservice.station.entity.Station;
import com.trainbooking.trainservice.station.repo.StationRepository;
import com.trainbooking.trainservice.train.entity.SeatClass;
import com.trainbooking.trainservice.train.entity.Train;
import com.trainbooking.trainservice.train.entity.TrainSeatConfig;
import com.trainbooking.trainservice.train.entity.TrainType;
import com.trainbooking.trainservice.train.repo.TrainRepository;
import com.trainbooking.trainservice.train.repo.TrainSeatConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrainDataSeeder {

    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final TrainRouteRepository trainRouteRepository;
    private final TrainSeatConfigRepository trainSeatConfigRepository;


    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void seedData() {
        log.info("Starting Train Data Seeder (Upsert Mode)...");
        // 1. Seed Major Indian Stations
        Station bct = upsertStation("BCT", "Mumbai Central", "Mumbai", "Maharashtra");
        Station ndls = upsertStation("NDLS", "New Delhi", "New Delhi", "Delhi");
        Station adi = upsertStation("ADI", "Ahmedabad Jn", "Ahmedabad", "Gujarat");
        Station mas = upsertStation("MAS", "MGR Chennai Central", "Chennai", "Tamil Nadu");
        Station hwh = upsertStation("HWH", "Howrah Jn", "Kolkata", "West Bengal");
        Station sbc = upsertStation("SBC", "Bengaluru City", "Bengaluru", "Karnataka");
        Station ljn = upsertStation("LJN", "Lucknow Jn", "Lucknow", "Uttar Pradesh");
        Station bsb = upsertStation("BSB", "Varanasi Jn", "Varanasi", "Uttar Pradesh");
        Station pune = upsertStation("PUNE", "Pune Jn", "Pune", "Maharashtra");
        // 2. Seed Trains
        Train rajdhani = upsertTrain("RJ-12951", "Rajdhani Express", TrainType.RAJDHANI);
        Train vandeBharat = upsertTrain("VB-20608", "Vande Bharat Express", TrainType.VANDE_BHARAT);
        Train shatabdi = upsertTrain("SH-12007", "Shatabdi Express", TrainType.SHATABDI);
        Train tejas = upsertTrain("TJ-82501", "Tejas Smart Express", TrainType.SUPERFAST);
        Train duronto = upsertTrain("DU-12259", "Duronto AC Express", TrainType.SUPERFAST);
        // 3. Seed Seat Configs
        upsertSeatConfig(rajdhani, SeatClass.AC_FIRST_CLASS, 50, new BigDecimal("4.5"));
        upsertSeatConfig(rajdhani, SeatClass.AC_2_TIER, 100, new BigDecimal("3.0"));

        upsertSeatConfig(vandeBharat, SeatClass.AC_FIRST_CLASS, 75, new BigDecimal("5.0"));
        upsertSeatConfig(vandeBharat, SeatClass.AC_CHAIR_CAR, 200, new BigDecimal("2.5"));

        upsertSeatConfig(shatabdi, SeatClass.AC_FIRST_CLASS, 60, new BigDecimal("4.0"));
        upsertSeatConfig(shatabdi, SeatClass.AC_CHAIR_CAR, 240, new BigDecimal("2.0"));

        upsertSeatConfig(tejas, SeatClass.AC_CHAIR_CAR, 300, new BigDecimal("2.8"));

        upsertSeatConfig(duronto, SeatClass.AC_FIRST_CLASS, 40, new BigDecimal("4.2"));
        upsertSeatConfig(duronto, SeatClass.AC_2_TIER, 120, new BigDecimal("3.1"));
        // 4. Seed Routes (Schedule)
        // Rajdhani (Mumbai <-> Delhi)
        upsertRoute(rajdhani, bct, 1, LocalTime.of(16, 0), LocalTime.of(16, 55), 0);
        upsertRoute(rajdhani, ndls, 2, LocalTime.of(8, 30), LocalTime.of(8, 50), 1386);
        // Vande Bharat (Mumbai <-> Ahmedabad)
        upsertRoute(vandeBharat, bct, 1, LocalTime.of(6, 0), LocalTime.of(6, 15), 0);
        upsertRoute(vandeBharat, adi, 2, LocalTime.of(11, 25), LocalTime.of(11, 45), 493);
        // Shatabdi (Bengaluru <-> Chennai)
        upsertRoute(shatabdi, sbc, 1, LocalTime.of(6, 0), LocalTime.of(6, 10), 0);
        upsertRoute(shatabdi, mas, 2, LocalTime.of(11, 0), LocalTime.of(11, 30), 358);

        // Tejas (Delhi <-> Lucknow)
        upsertRoute(tejas, ndls, 1, LocalTime.of(6, 10), LocalTime.of(6, 25), 0);
        upsertRoute(tejas, ljn, 2, LocalTime.of(12, 25), LocalTime.of(12, 40), 512);
        // Duronto (Kolkata <-> Delhi)
        upsertRoute(duronto, hwh, 1, LocalTime.of(8, 35), LocalTime.of(8, 50), 0);
        upsertRoute(duronto, ndls, 2, LocalTime.of(6, 0), LocalTime.of(6, 20), 1447);
        log.info("Train Data Seeding Completed!");
    }

    private Station upsertStation(String code, String name, String city, String state) {
        return stationRepository.findByCode(code).orElseGet(() -> {
            Station s = new Station();
            s.setCode(code);
            s.setName(name);
            s.setCity(city);
            s.setState(state);
            return stationRepository.save(s);
        });
    }
    private Train upsertTrain(String code, String name, TrainType type) {
        return trainRepository.findByCode(code).orElseGet(() -> {
            Train t = new Train();
            t.setCode(code);
            t.setName(name);
            t.setTrainType(type.name());
            return trainRepository.save(t);
        });
    }
    private void upsertSeatConfig(Train train, SeatClass seatClass, int totalSeats, BigDecimal fare) {
        trainSeatConfigRepository.findByTrainIdAndSeatClass(train.getId(), seatClass)
                .orElseGet(() -> {
                    TrainSeatConfig c = new TrainSeatConfig();
                    c.setTrain(train);
                    c.setSeatClass(seatClass);
                    c.setTotalSeats(totalSeats);
                    c.setFarePerKm(fare);
                    return trainSeatConfigRepository.save(c);
                });
    }
    private void upsertRoute(Train train, Station station, int stopOrder, LocalTime arrival, LocalTime departure, int distance) {
        if (!trainRouteRepository.existsByTrainIdAndStopOrder(train.getId(), stopOrder)) {
            TrainRoute r = new TrainRoute();
            r.setTrain(train);
            r.setStation(station);
            r.setStopOrder(stopOrder);
            r.setArrivalTime(arrival);
            r.setDepartureTime(departure);
            r.setDistanceFromSource(distance);
            trainRouteRepository.save(r);
        }
    }
}
