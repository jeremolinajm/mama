package com.flavia.dermobeauty.booking.infrastructure.notification;

import com.flavia.dermobeauty.booking.application.port.NotificationService;
import com.flavia.dermobeauty.booking.domain.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub implementation of NotificationService for Phase 5.
 * Will be replaced with full email implementation in Phase 8.
 */
@Slf4j
@Service
public class StubNotificationService implements NotificationService {

    @Override
    public void sendBookingConfirmation(Booking booking) {
        log.info("STUB: Would send booking confirmation email for {} to {}",
                booking.getBookingNumber(),
                booking.getCustomerInfo().getEmail());

        // No-op for now - will implement email sending in Phase 8
    }
}
