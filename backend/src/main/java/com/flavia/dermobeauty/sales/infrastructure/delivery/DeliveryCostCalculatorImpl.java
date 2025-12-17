package com.flavia.dermobeauty.sales.infrastructure.delivery;

import com.flavia.dermobeauty.sales.application.port.DeliveryCostCalculator;
import com.flavia.dermobeauty.sales.domain.DeliveryType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Implementation of DeliveryCostCalculator reading from configuration.
 * For MVP, uses fixed cost from application.yml.
 * Future: could read from database config table.
 */
@Slf4j
@Service
public class DeliveryCostCalculatorImpl implements DeliveryCostCalculator {

    private final BigDecimal fixedDeliveryCost;

    public DeliveryCostCalculatorImpl(@Value("${app.delivery.fixed-cost:1500.00}") BigDecimal fixedCost) {
        this.fixedDeliveryCost = fixedCost;
        log.info("Delivery cost configured: {}", fixedCost);
    }

    @Override
    public BigDecimal calculate(DeliveryType deliveryType) {
        if (deliveryType == DeliveryType.PICKUP) {
            log.debug("Delivery cost for PICKUP: 0.00");
            return BigDecimal.ZERO;
        }

        log.debug("Delivery cost for HOME_DELIVERY: {}", fixedDeliveryCost);
        return fixedDeliveryCost;
    }
}
