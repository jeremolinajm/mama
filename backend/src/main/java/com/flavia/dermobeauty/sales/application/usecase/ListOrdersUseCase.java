package com.flavia.dermobeauty.sales.application.usecase;

import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.sales.domain.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Use Case: List orders for admin panel.
 * Supports filtering by status and pagination.
 */
@Slf4j
@RequiredArgsConstructor
public class ListOrdersUseCase {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<Order> execute() {
        log.debug("Fetching all orders");
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Order> executePaginated(Pageable pageable) {
        log.debug("Fetching orders with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return orderRepository.findAll(pageable);
    }

    public List<Order> executeByStatus(OrderStatus status) {
        log.debug("Fetching orders with status: {}", status);
        return orderRepository.findByStatus(status);
    }
}
