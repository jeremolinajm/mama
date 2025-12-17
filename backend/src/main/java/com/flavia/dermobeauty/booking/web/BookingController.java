package com.flavia.dermobeauty.booking.web;

import com.flavia.dermobeauty.booking.application.usecase.CreateBookingUseCase;
import com.flavia.dermobeauty.booking.application.usecase.GetBookingByNumberUseCase;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.web.dto.BookingResponse;
import com.flavia.dermobeauty.booking.web.dto.CreateBookingRequest;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for booking operations.
 * Public endpoints for customers to create and check bookings.
 */
@Slf4j
@RestController
@RequestMapping("/api/public/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final CreateBookingUseCase createBookingUseCase;
    private final GetBookingByNumberUseCase getBookingByNumberUseCase;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {

        log.info("Creating booking for service {} on {} at {}",
                request.getServiceId(), request.getBookingDate(), request.getBookingTime());

        Booking booking = createBookingUseCase.execute(
                request.getServiceId(),
                request.getCustomerName(),
                request.getCustomerEmail(),
                request.getCustomerWhatsapp(),
                request.getCustomerComments(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getDurationMinutes(),
                request.getAmount()
        );

        BookingResponse response = BookingResponse.fromDomain(booking);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @GetMapping("/{bookingNumber}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByNumber(
            @PathVariable String bookingNumber) {

        log.debug("Fetching booking: {}", bookingNumber);

        Booking booking = getBookingByNumberUseCase.execute(bookingNumber);
        BookingResponse response = BookingResponse.fromDomain(booking);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
