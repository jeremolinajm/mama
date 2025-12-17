package com.flavia.dermobeauty.sales.infrastructure.persistence;

import com.flavia.dermobeauty.sales.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for OrderEntity.
 * Infrastructure implementation detail.
 */
@Repository
public interface JpaOrderRepository extends JpaRepository<OrderEntity, Long> {

    Optional<OrderEntity> findByOrderNumber(String orderNumber);

    Optional<OrderEntity> findByMercadoPagoPaymentId(String paymentId);

    List<OrderEntity> findByStatus(OrderStatus status);
}
