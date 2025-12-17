package com.flavia.dermobeauty.sales.application.usecase;

import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.sales.domain.OrderStatus;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Update order status.
 * Used by admin to move order through fulfillment stages.
 */
@Slf4j
@RequiredArgsConstructor
public class UpdateOrderStatusUseCase {

    private final OrderRepository orderRepository;

    public Order execute(Long orderId, OrderStatus newStatus) {
        log.info("Updating order {} to status: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Update status (domain logic validates transition)
        order.updateStatus(newStatus);

        // Persist
        Order updated = orderRepository.save(order);
        log.info("Order status updated: {} -> {}", updated.getOrderNumber(), newStatus);

        return updated;
    }
}
