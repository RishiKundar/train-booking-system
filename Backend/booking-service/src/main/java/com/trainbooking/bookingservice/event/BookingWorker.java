package com.trainbooking.bookingservice.event;

import com.trainbooking.bookingservice.eventmodel.BookingEvent;
import com.trainbooking.bookingservice.service.BookingCommandService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingWorker {

    private final BookingQueue bookingQueue;
    private final BookingCommandService bookingCommandService;

    @PostConstruct
    public void start(){
        Thread worker = new Thread(() -> {
            while(true){
                try{
                    BookingEvent bookingEvent = bookingQueue.consume();
                    bookingCommandService.processBooking(bookingEvent);
                    log.info("Processing bookingId: {}", bookingEvent.getBookingId());
                } catch (InterruptedException e) {
                    log.warn("Booking worker thread interrupted – shutting down");
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("Error processing booking event: {}", e.getMessage(), e);
                }
            }
        });
        worker.setName("booking-worker-thread");
        worker.setDaemon(true);
        worker.start();
        log.info("Booking worker started");
    }
}
