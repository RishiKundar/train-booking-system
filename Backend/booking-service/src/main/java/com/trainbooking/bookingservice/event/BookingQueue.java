package com.trainbooking.bookingservice.event;

import com.trainbooking.bookingservice.eventmodel.BookingEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@Slf4j
@Component
public class BookingQueue {

    private final BlockingQueue<BookingEvent> queue = new LinkedBlockingQueue<>();

    public void publish(BookingEvent bookingEvent){
        log.info("Event pushed to queue: {}", bookingEvent.getBookingId());
        queue.offer(bookingEvent);
    }

    public BookingEvent consume() throws InterruptedException{
        return queue.take();
    }
}
