package com.flavia.dermobeauty.sales.application.port;

import com.flavia.dermobeauty.sales.domain.Order;

/**
 * Port (interface) for payment operations.
 * Will be implemented by the payment module infrastructure.
 */
public interface PaymentService {

    /**
     * Create a Mercado Pago payment preference for an order.
     *
     * @param order The order to create payment for
     * @return Preference ID
     */
    String createOrderPreference(Order order);
}
