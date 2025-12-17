package com.flavia.dermobeauty.sales.infrastructure.persistence;

import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.sales.domain.OrderStatus;
import com.flavia.dermobeauty.sales.infrastructure.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional; // <--- IMPORTANTE

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderRepositoryAdapter implements OrderRepository {

    private final JpaOrderRepository jpaRepository;
    private final OrderMapper mapper;

    @Override
    @Transactional // Para escritura
    public Order save(Order order) {
        OrderEntity entity = mapper.toEntity(order);
        OrderEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true) // <--- AGREGAR ESTO (Mantiene la sesión DB abierta)
    public Optional<Order> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true) // <--- AGREGAR ESTO
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return jpaRepository.findByOrderNumber(orderNumber)
                .map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true) // <--- AGREGAR ESTO
    public Optional<Order> findByMercadoPagoPaymentId(String paymentId) {
        return jpaRepository.findByMercadoPagoPaymentId(paymentId)
                .map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true) // <--- AGREGAR ESTO (CRÍTICO PARA LA LISTA)
    public List<Order> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true) // <--- AGREGAR ESTO
    public List<Order> findByStatus(OrderStatus status) {
        return jpaRepository.findByStatus(status)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}