package com.trainbooking.bookingservice.exception;



import com.trainbooking.bookingservice.dto.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBooking(BookingException ex){
        return ResponseEntity.status(ex.getStatus())
                .body(ErrorResponse.builder()
                        .error(ex.getStatus().getReasonPhrase())
                        .status(ex.getStatus().value())
                        .timestamp(Instant.now())
                        .message(ex.getMessage()).build());
    }

    @ExceptionHandler(InsufficientSeatsException.class)
    public ResponseEntity<Map<String,Object>> handleInsufficientSeats(InsufficientSeatsException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error",ex.getMessage()));
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> handleGeneric(Exception ex){
        log.error("Unhandled exception: {}", ex.getMessage(), ex); // ← now visible in logs
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).
                body(Map.of("error","Something Went Wrong",
                        "message", ex.getMessage() != null ? ex.getMessage() : "null",
                        "timestamp", LocalDateTime.now(),
                        "status","500"
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex){
        String errorMsg = ex.getBindingResult().getFieldErrors().getFirst().getDefaultMessage();

        assert errorMsg != null;
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", errorMsg
                ,"timestamp",LocalDateTime.now(),
                        "status","400")); // ← was wrongly "500"
    }

    @ExceptionHandler(BookingFailedException.class)
    public ResponseEntity<Map<String,Object>> handleOverBooking(BookingFailedException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error",ex.getMessage()));
    }

    @ExceptionHandler(ReBookingException.class)
    public ResponseEntity<Map<String,Object>> handleDuplicateBooking(ReBookingException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error",ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String,Object>> handleBusinessException(BusinessException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", ex.getMessage(), // ← was putting the whole object, not message
                "timestamp", Instant.now(),
                "status", HttpStatus.CONFLICT.value()
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,Object>> handleDuplicate(DataIntegrityViolationException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error","Duplicate Booking",
                "timestamp", Instant.now(),
                "status", HttpStatus.CONFLICT.value()
        ));
    }


}
