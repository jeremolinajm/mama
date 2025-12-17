package com.flavia.dermobeauty.sales.application.port;

import com.flavia.dermobeauty.sales.domain.Order;

/**
 * Port (interface) for notification operations.
 * Will be implemented by the notification module infrastructure.
 */
public interface NotificationService {

    /**
     * Send order confirmation email to customer.
     *
     * @param order The confirmed order
     */
    void sendOrderConfirmation(Order order);
}
