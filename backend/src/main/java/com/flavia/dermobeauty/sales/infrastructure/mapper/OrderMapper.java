package com.flavia.dermobeauty.sales.infrastructure.mapper;

import com.flavia.dermobeauty.sales.domain.*;
import com.flavia.dermobeauty.sales.infrastructure.persistence.OrderEntity;
import com.flavia.dermobeauty.sales.infrastructure.persistence.OrderItemEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper between Order domain model and OrderEntity JPA entity.
 * Handles conversion in both directions including nested OrderItems.
 */
@Component
public class OrderMapper {

    /**
     * Convert domain Order to JPA OrderEntity.
     */
    public OrderEntity toEntity(Order order) {
        OrderEntity entity = OrderEntity.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerInfo().getName())
                .customerEmail(order.getCustomerInfo().getEmail())
                .customerWhatsapp(order.getCustomerInfo().getWhatsapp())
                .deliveryType(order.getDeliveryInfo().getDeliveryType())
                .deliveryAddress(order.getDeliveryInfo().getAddress())
                .deliveryCity(order.getDeliveryInfo().getCity())
                .deliveryPostalCode(order.getDeliveryInfo().getPostalCode())
                .deliveryProvince(order.getDeliveryInfo().getProvince())
                .deliveryNotes(order.getDeliveryInfo().getNotes())
                .subtotal(order.getSubtotal())
                .deliveryCost(order.getDeliveryCost())
                .total(order.getTotal())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .mercadoPagoPreferenceId(order.getMercadoPagoPreferenceId())
                .mercadoPagoPaymentId(order.getMercadoPagoPaymentId())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();

        // Map items
        order.getItems().forEach(item -> {
            OrderItemEntity itemEntity = OrderItemEntity.builder()
                    .id(item.getId())
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .productPrice(item.getProductPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .build();
            entity.addItem(itemEntity);
        });

        return entity;
    }

    /**
     * Convert JPA OrderEntity to domain Order.
     */
    public Order toDomain(OrderEntity entity) {
        CustomerInfo customerInfo = new CustomerInfo(
                entity.getCustomerName(),
                entity.getCustomerEmail(),
                entity.getCustomerWhatsapp()
        );

        DeliveryInfo deliveryInfo = new DeliveryInfo(
                entity.getDeliveryType(),
                entity.getDeliveryAddress(),
                entity.getDeliveryCity(),
                entity.getDeliveryPostalCode(),
                entity.getDeliveryProvince(),
                entity.getDeliveryNotes()
        );

        Order order = Order.builder()
                .id(entity.getId())
                .orderNumber(entity.getOrderNumber())
                .customerInfo(customerInfo)
                .deliveryInfo(deliveryInfo)
                .items(entity.getItems().stream()
                        .map(this::itemToDomain)
                        .collect(Collectors.toList()))
                .subtotal(entity.getSubtotal())
                .deliveryCost(entity.getDeliveryCost())
                .total(entity.getTotal())
                .status(entity.getStatus())
                .paymentStatus(entity.getPaymentStatus())
                .mercadoPagoPreferenceId(entity.getMercadoPagoPreferenceId())
                .mercadoPagoPaymentId(entity.getMercadoPagoPaymentId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        return order;
    }

    private OrderItem itemToDomain(OrderItemEntity entity) {
        return OrderItem.builder()
                .id(entity.getId())
                .productId(entity.getProductId())
                .productName(entity.getProductName())
                .productPrice(entity.getProductPrice())
                .quantity(entity.getQuantity())
                .subtotal(entity.getSubtotal())
                .build();
    }
}
