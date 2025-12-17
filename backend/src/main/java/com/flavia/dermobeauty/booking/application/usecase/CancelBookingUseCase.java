package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Cancel a booking.
 * Can be initiated by admin or customer.
 */
@Slf4j
@RequiredArgsConstructor
public class CancelBookingUseCase {

    private final BookingRepository bookingRepository;

    public Booking execute(Long bookingId) {
        log.info("Cancelling booking: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        // Cancel (domain logic validates business rules)
        booking.cancel();

        // Persist
        Booking updated = bookingRepository.save(booking);
        log.info("Booking cancelled: {}", updated.getBookingNumber());

        return updated;
    }
}
