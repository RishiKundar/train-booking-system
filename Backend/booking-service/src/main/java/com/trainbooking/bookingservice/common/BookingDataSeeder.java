package com.trainbooking.bookingservice.common;

import com.trainbooking.bookingservice.entity.SeatInventory;
import com.trainbooking.bookingservice.repo.SeatInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingDataSeeder {

    private final SeatInventoryRepository seatInventoryRepository;

    // Runs on startup and midnight to ensure the next 30 days are always stocked
    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void generateInventory() {
        log.info("Starting Booking Inventory Seeder (Upsert Mode)...");

        LocalDate today = LocalDate.now();

        // Because TrainDataSeeder generates 5 trains automatically, they will likely be assigned IDs 1 through 5.
        // If your IDs differ in the database, update this list accordingly!
        List<Long> activeTrainIds = List.of(1L, 2L, 3L, 4L, 5L);

        for (Long trainId : activeTrainIds) {
            for (int i = 0; i <= 30; i++) {
                LocalDate travelDate = today.plusDays(i);

                // Add common seat classes. (These must match the seat classes created in TrainDataSeeder)
                upsertInventory(trainId, travelDate, "AC_FIRST_CLASS", 50);
                upsertInventory(trainId, travelDate, "AC_2_TIER", 100);
                upsertInventory(trainId, travelDate, "AC_CHAIR_CAR", 200);
            }
        }

        log.info("Booking Inventory Seeding Completed for next 30 days!");
    }

    private void upsertInventory(Long trainId, LocalDate travelDate, String seatClass, int totalSeats) {
        if (!seatInventoryRepository.existsByTrainIdAndTravelDateAndSeatClass(trainId, travelDate, seatClass)) {
            SeatInventory inv = new SeatInventory();
            inv.setTrainId(trainId);
            inv.setTravelDate(travelDate);
            inv.setSeatClass(seatClass);
            inv.setTotalSeats(totalSeats);
            inv.setAvailableSeats(totalSeats);
            seatInventoryRepository.save(inv);
        }
    }
}