package com.flavia.dermobeauty.sales.infrastructure.notification;

import com.flavia.dermobeauty.sales.application.port.NotificationService;
import com.flavia.dermobeauty.sales.domain.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub implementation of NotificationService for Phase 6.
 * Will be replaced with full email implementation in Phase 8.
 */
@Slf4j
@Service("orderNotificationService")
public class StubOrderNotificationService implements NotificationService {

    @Override
    public void sendOrderConfirmation(Order order) {
        log.info("STUB: Would send order confirmation email for {} to {}",
                order.getOrderNumber(),
                order.getCustomerInfo().getEmail());

        // No-op for now - will implement email sending in Phase 8
    }
}
