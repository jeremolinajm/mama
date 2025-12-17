package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Use Case: Block an entire day or specific time range.
 * Creates a special BLOCKED booking to prevent customer bookings.
 * Used for holidays, personal days, or maintenance periods.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BlockScheduleUseCase {

    private final BookingRepository bookingRepository;

    /**
     * Blocks an entire day by creating a BLOCKED booking spanning the full business hours.
     *
     * @param date the date to block
     * @param reason optional reason for blocking (e.g., "Holiday - Christmas")
     * @return the created block booking
     */
    public Booking executeBlockFullDay(LocalDate date, String reason) {
        return executeBlockTimeRange(
                date,
                LocalTime.of(0, 0),   // Block from midnight
                LocalTime.of(23, 59), // to end of day
                reason
        );
    }

    /**
     * Blocks a specific time range on a date.
     *
     * @param date the date to block
     * @param startTime start time of block
     * @param endTime end time of block
     * @param reason optional reason for blocking
     * @return the created block booking
     */
    public Booking executeBlockTimeRange(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String reason
    ) {
        log.info("Blocking schedule for {} from {} to {}. Reason: {}",
                date, startTime, endTime, reason);

        // Calculate duration in minutes
        int durationMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();

        // Create time slot
        TimeSlot timeSlot = new TimeSlot(date, startTime);

        // Create customer info for the block
        CustomerInfo blockInfo = new CustomerInfo(
                reason != null && !reason.isBlank() ? reason : "BLOQUEO AGENDA",
                "admin@interno.com",
                "00000000",
                "Horario bloqueado por administrador"
        );

        // Create the BLOCKED booking
        Booking blockBooking = Booking.builder()
                .bookingNumber("BLOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .serviceId(null) // No service associated
                .customerInfo(blockInfo)
                .timeSlot(timeSlot)
                .durationMinutes(durationMinutes)
                .status(BookingStatus.BLOCKED)
                .paymentStatus(PaymentStatus.NOT_REQUIRED)
                .amount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Persist
        Booking saved = bookingRepository.save(blockBooking);
        log.info("Schedule blocked successfully with booking number: {}", saved.getBookingNumber());

        return saved;
    }

    /**
     * Unblocks a day by deleting all BLOCKED bookings for that date.
     *
     * @param date the date to unblock
     */
    public void executeUnblockDay(LocalDate date) {
        log.info("Unblocking schedule for {}", date);

        List<Booking> blockedBookings = bookingRepository.findByDate(date).stream()
                .filter(b -> b.getStatus() == BookingStatus.BLOCKED)
                .toList();

        blockedBookings.forEach(booking -> {
            booking.cancel(); // Reuse cancel logic
            bookingRepository.save(booking);
        });

        log.info("Removed {} blocked time slots for {}", blockedBookings.size(), date);
    }
}
