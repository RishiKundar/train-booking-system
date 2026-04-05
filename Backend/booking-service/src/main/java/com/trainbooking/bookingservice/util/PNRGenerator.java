package com.trainbooking.bookingservice.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class PNRGenerator {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generatePnr(LocalDate travelDate){
        String datePart = travelDate.format(DATE_TIME_FORMATTER);
        String uniquePart = UUID
                .randomUUID()
                .toString()
                .replace("-","")
                .substring(0,6)
                .toUpperCase();

        return "TBS" + datePart + uniquePart;
    }

    private PNRGenerator(){

    }
}
