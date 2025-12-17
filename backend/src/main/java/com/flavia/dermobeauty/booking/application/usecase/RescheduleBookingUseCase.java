package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.booking.domain.TimeSlot;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Use Case: Reschedule an existing booking to a new date and time.
 * Used by admin when dragging bookings in the calendar.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RescheduleBookingUseCase {

    private final BookingRepository bookingRepository;

    public Booking execute(Long bookingId, LocalDate newDate, LocalTime newTime) {
        log.info("Rescheduling booking {} to {} at {}", bookingId, newDate, newTime);

        // Find the booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        // Create new time slot
        TimeSlot newTimeSlot = new TimeSlot(newDate, newTime);

        // Reschedule (domain logic with validation)
        booking.reschedule(newTimeSlot);

        // Persist
        Booking updated = bookingRepository.save(booking);
        log.info("Booking {} rescheduled successfully to {} at {}",
                bookingId, newDate, newTime);

        return updated;
    }
}
