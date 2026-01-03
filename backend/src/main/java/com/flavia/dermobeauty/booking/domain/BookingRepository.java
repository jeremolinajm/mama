package com.flavia.dermobeauty.booking.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository port (interface) for Booking aggregate.
 * Defines operations needed by the domain layer without specifying implementation.
 * Implementation will be provided by infrastructure layer.
 */
public interface BookingRepository {

    /**
     * Save a booking (create or update).
     */
    Booking save(Booking booking);

    /**
     * Find booking by ID.
     */
    Optional<Booking> findById(Long id);

    /**
     * Find booking by booking number.
     */
    Optional<Booking> findByBookingNumber(String bookingNumber);

    /**
     * Find booking by Mercado Pago payment ID.
     */
    Optional<Booking> findByMercadoPagoPaymentId(String paymentId);

    /**
     * Check if a slot is available (no overlapping bookings).
     * Global check - single resource model (Flavia handles all services).
     * Returns true if the slot is free.
     */
    boolean isTimeSlotAvailable(LocalDate date, LocalTime startTime, LocalTime endTime);

    /**
     * Find all bookings (for admin).
     */
    List<Booking> findAll();

    /**
     * Find bookings by status (for admin filtering).
     */
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByDate(LocalDate date);

    /**
     * Find bookings within a date range for calendar display.
     * @param from start of range (inclusive)
     * @param to end of range (inclusive)
     * @param includeCancelled if true, includes cancelled bookings
     * @return list of bookings in range
     */
    List<Booking> findByDateRange(OffsetDateTime from, OffsetDateTime to, boolean includeCancelled);

}
