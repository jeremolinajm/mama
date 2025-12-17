package com.flavia.dermobeauty.booking.application.port;

import com.flavia.dermobeauty.booking.domain.Booking;

/**
 * Port (interface) for notification operations.
 * Will be implemented by the notification module infrastructure.
 */
public interface NotificationService {

    /**
     * Send booking confirmation email to customer.
     *
     * @param booking The confirmed booking
     */
    void sendBookingConfirmation(Booking booking);
}
