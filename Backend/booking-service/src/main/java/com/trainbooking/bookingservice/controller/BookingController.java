package com.trainbooking.bookingservice.controller;

import com.trainbooking.bookingservice.dto.BookingResponse;
import com.trainbooking.bookingservice.dto.CreateBookingRequest;
import com.trainbooking.bookingservice.dto.EnrichedBookingResponse;
import com.trainbooking.bookingservice.service.BookingCommandService;
import com.trainbooking.bookingservice.service.BookingQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/booking/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Create, view, and cancel train bookings. All operations require authentication.")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingQueryService bookingQueryService;
    private final BookingCommandService bookingCommandService;

    @GetMapping("/my")
    @Operation(
        summary = "Get my bookings",
        description = "Returns all bookings (PENDING, CONFIRMED, CANCELLED, FAILED) for the currently authenticated user."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Bookings returned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid")
    })
    public Page<BookingResponse> getMyBookings(
            HttpServletRequest httpServletRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page,size, Sort.by("travelDate").descending());

        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");
        return bookingQueryService.getBookingForUser(userId,pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
        summary = "Create a booking",
        description = "Asynchronously creates a booking. Returns a bookingId with status PENDING immediately. " +
                      "The booking is processed in the background — poll GET /{pnr} after 1-2 seconds to check if it was CONFIRMED or FAILED. " +
                      "Idempotency key prevents duplicate bookings on retry."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "202", description = "Booking accepted and queued for processing"),
        @ApiResponse(responseCode = "400", description = "Validation failed — missing or invalid fields"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid")
    })
    public ResponseEntity<Map<String, Object>> createBooking(
            HttpServletRequest httpServletRequest,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");
        UUID bookingId = bookingCommandService.createBookingAsync(userId, request);
        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(Map.of("bookingId", bookingId, "status", "PENDING"));
    }

    @GetMapping("/{pnr}")
    @Operation(
        summary = "Get booking by PNR",
        description = "Fetches a specific booking by its PNR number. Only the owner of the booking can access it."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking details returned"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "404", description = "No booking found with this PNR for the current user")
    })
    public ResponseEntity<BookingResponse> getBookingByPnr(
            @Parameter(description = "PNR number of the booking", example = "TBS20260501AB4X9Z")
            @PathVariable String pnr,
            HttpServletRequest request
    ) {
        UUID userId = (UUID) request.getAttribute("USER_ID");
        return ResponseEntity.ok(bookingQueryService.getBookingByPnr(pnr, userId));
    }

    @DeleteMapping("/{pnr}")
    @Operation(
        summary = "Cancel a booking",
        description = "Cancels a CONFIRMED booking by PNR. Rules: booking must be CONFIRMED, travel date must be in the future, and the requester must be the owner. Cancelled seats are restored to inventory."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot cancel — past travel date or wrong status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<Map<String, String>> cancelBooking(
            @Parameter(description = "PNR number of the booking to cancel", example = "TBS20260501AB4X9Z")
            @PathVariable String pnr,
            HttpServletRequest httpServletRequest
    ) {
        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");
        bookingCommandService.cancelBooking(pnr, userId);
        return ResponseEntity.ok(Map.of(
                "pnr", pnr,
                "status", "CANCELLED",
                "message", "Booking cancelled successfully. Seats have been restored."
        ));
    }


    @GetMapping("/my-enriched")
    @Operation(summary = "Get my enriched bookings for the Dashboard")
    public Page<EnrichedBookingResponse> getMyEnrichedBookings(
            HttpServletRequest httpServletRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("travelDate").descending());
        UUID userId = (UUID) httpServletRequest.getAttribute("USER_ID");
        return bookingQueryService.getEnrichedBookingsForUser(userId, pageable);
    }
}
