package com.flavia.dermobeauty.sales.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Repository port (interface) for Order aggregate.
 * Defines operations needed by the domain layer without specifying implementation.
 * Implementation will be provided by infrastructure layer.
 */
public interface OrderRepository {

    /**
     * Save an order (create or update).
     */
    Order save(Order order);

    /**
     * Find order by ID.
     */
    Optional<Order> findById(Long id);

    /**
     * Find order by order number.
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Find order by Mercado Pago payment ID.
     */
    Optional<Order> findByMercadoPagoPaymentId(String paymentId);

    /**
     * Find all orders (for admin).
     */
    List<Order> findAll();

    /**
     * Find all orders with pagination (for admin).
     */
    Page<Order> findAll(Pageable pageable);

    /**
     * Find orders by status (for admin filtering).
     */
    List<Order> findByStatus(OrderStatus status);
}
