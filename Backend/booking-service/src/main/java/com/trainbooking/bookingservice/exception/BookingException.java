package com.trainbooking.bookingservice.exception;

import org.springframework.http.HttpStatus;


public class BookingException extends RuntimeException {

    private final HttpStatus httpStatus;

    public BookingException(String message, HttpStatus httpStatus1) {
        super(message);
        this.httpStatus = httpStatus1;
    }

    public HttpStatus getStatus(){
        return httpStatus;
    }


}
