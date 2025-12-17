package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Get booking by booking number.
 * Used by customers to check their booking status.
 */
@Slf4j
@RequiredArgsConstructor
public class GetBookingByNumberUseCase {

    private final BookingRepository bookingRepository;

    public Booking execute(String bookingNumber) {
        log.debug("Fetching booking by number: {}", bookingNumber);

        return bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with number '" + bookingNumber + "' not found"));
    }
}
