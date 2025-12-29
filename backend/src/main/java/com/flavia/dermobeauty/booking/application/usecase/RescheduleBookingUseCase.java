package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.shared.exception.ConflictException;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import com.flavia.dermobeauty.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;

/**
 * Use case for rescheduling a booking to a new time.
 * Validates alignment rules and checks for collisions.
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class RescheduleBookingUseCase {

    private final BookingRepository bookingRepository;
    private final BlockRepository blockRepository;

    /**
     * Reschedules a booking to a new start time.
     *
     * @param bookingId the ID of the booking to reschedule
     * @param newStartAt the new start time (must be aligned to 30-min intervals)
     * @return the rescheduled booking
     * @throws ResourceNotFoundException if booking not found
     * @throws ValidationException if alignment rules are violated
     * @throws ConflictException if the new time conflicts with existing bookings or blocks
     */
    public Booking execute(Long bookingId, OffsetDateTime newStartAt) {
        log.info("Rescheduling booking {} to {}", bookingId, newStartAt);

        // Find booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        // Validate alignment
        int minute = newStartAt.getMinute();
        if (minute != 0 && minute != 30) {
            throw new ValidationException("El horario debe estar alineado a intervalos de 30 minutos (:00 o :30)");
        }

        // Calculate new end time
        OffsetDateTime newEndAt = newStartAt.plusMinutes(booking.getDurationMinutes());

        // Check for collisions with other bookings (excluding this one)
        if (hasBookingCollision(bookingId, newStartAt, newEndAt)) {
            throw new ConflictException("El nuevo horario colisiona con otro turno existente");
        }

        // Check for collisions with blocks
        if (blockRepository.existsActiveBlockInRange(newStartAt, newEndAt)) {
            throw new ConflictException("El nuevo horario colisiona con un bloqueo existente");
        }

        // Reschedule
        booking.reschedule(newStartAt);

        // Persist
        Booking saved = bookingRepository.save(booking);
        log.info("Booking {} rescheduled to {}", saved.getBookingNumber(), newStartAt);

        return saved;
    }

    private boolean hasBookingCollision(Long excludeBookingId, OffsetDateTime startAt, OffsetDateTime endAt) {
        // Query bookings in range (only those that occupy time: PENDING, CONFIRMED)
        return bookingRepository.findByDateRange(startAt, endAt, false).stream()
                .filter(b -> !b.getId().equals(excludeBookingId)) // Exclude current booking
                .anyMatch(booking -> {
                    OffsetDateTime bookingStart = booking.getStartAt();
                    OffsetDateTime bookingEnd = booking.getEndAt();
                    // Collision: A.start < B.end AND B.start < A.end
                    return bookingStart.isBefore(endAt) && startAt.isBefore(bookingEnd);
                });
    }
}
