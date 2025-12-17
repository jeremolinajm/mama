package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.domain.BookingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Use Case: List bookings for admin panel.
 * Supports filtering by status.
 */
@Slf4j
@RequiredArgsConstructor
public class ListBookingsUseCase {

    private final BookingRepository bookingRepository;

    public List<Booking> execute() {
        log.debug("Fetching all bookings");
        return bookingRepository.findAll();
    }

    public List<Booking> executeByStatus(BookingStatus status) {
        log.debug("Fetching bookings with status: {}", status);
        return bookingRepository.findByStatus(status);
    }
}
