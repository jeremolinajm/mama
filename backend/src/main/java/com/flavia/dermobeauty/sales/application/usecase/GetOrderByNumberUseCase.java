package com.flavia.dermobeauty.sales.application.usecase;

import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Get order by order number.
 * Used by customers to check their order status.
 */
@Slf4j
@RequiredArgsConstructor
public class GetOrderByNumberUseCase {

    private final OrderRepository orderRepository;

    public Order execute(String orderNumber) {
        log.debug("Fetching order by number: {}", orderNumber);

        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order with number '" + orderNumber + "' not found"));
    }
}
