package com.flavia.dermobeauty.sales.application.port;

import com.flavia.dermobeauty.sales.domain.DeliveryType;

import java.math.BigDecimal;

/**
 * Port (interface) for calculating delivery costs.
 * Will be implemented by infrastructure reading from config.
 */
public interface DeliveryCostCalculator {

    /**
     * Calculate delivery cost based on delivery type.
     *
     * @param deliveryType Type of delivery
     * @return Delivery cost (0 for PICKUP)
     */
    BigDecimal calculate(DeliveryType deliveryType);
}
