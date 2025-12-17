package com.flavia.dermobeauty.booking.domain;

import java.time.LocalDate;
import java.time.LocalTime;
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
     * Check if a slot is already booked for a service.
     * Returns true if there's an active (non-cancelled) booking for this slot.
     */
    boolean isTimeSlotAvailable(Long serviceId, LocalDate date, LocalTime startTime, LocalTime endTime);

    /**
     * Find all bookings (for admin).
     */
    List<Booking> findAll();

    /**
     * Find bookings by status (for admin filtering).
     */
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByDate(LocalDate date);

}
