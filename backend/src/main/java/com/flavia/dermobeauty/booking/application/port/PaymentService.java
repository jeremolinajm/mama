package com.flavia.dermobeauty.booking.application.port;

import com.flavia.dermobeauty.booking.domain.Booking;

/**
 * Port (interface) for payment operations.
 * Will be implemented by the payment module infrastructure.
 */
public interface PaymentService {

    /**
     * Create a Mercado Pago payment preference for a booking.
     *
     * @param booking The booking to create payment for
     * @return Preference ID
     */
    String createBookingPreference(Booking booking);
}
