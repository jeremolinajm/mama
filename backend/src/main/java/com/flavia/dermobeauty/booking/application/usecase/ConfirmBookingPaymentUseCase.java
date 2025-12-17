package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.application.port.NotificationService;
import com.flavia.dermobeauty.booking.domain.Booking;
import com.flavia.dermobeauty.booking.domain.BookingRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Confirm booking payment.
 * Called from Mercado Pago webhook when payment is approved.
 */
@Slf4j
@RequiredArgsConstructor
public class ConfirmBookingPaymentUseCase {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public Booking execute(String paymentId) {
        log.info("Confirming payment for payment ID: {}", paymentId);

        // Find booking by payment ID
        Booking booking = bookingRepository.findByMercadoPagoPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with payment ID '" + paymentId + "' not found"));

        // Confirm payment (domain logic)
        booking.confirmPayment(paymentId);

        // Persist
        Booking updated = bookingRepository.save(booking);
        log.info("Payment confirmed for booking: {}", updated.getBookingNumber());

        // Send confirmation email (async, non-blocking)
        try {
            notificationService.sendBookingConfirmation(updated);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation email for {}", updated.getBookingNumber(), e);
            // Don't throw - email failure should not break payment confirmation
        }

        return updated;
    }
}
