package com.flavia.dermobeauty.sales.web.dto;

import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import com.flavia.dermobeauty.sales.domain.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for order response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerWhatsapp;
    private DeliveryType deliveryType;
    private String deliveryAddress;
    private String deliveryCity;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal deliveryCost;
    private BigDecimal total;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String mercadoPagoPreferenceId;
    private LocalDateTime createdAt;

    public static OrderResponse fromDomain(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerInfo().getName())
                .customerEmail(order.getCustomerInfo().getEmail())
                .customerWhatsapp(order.getCustomerInfo().getWhatsapp())
                .deliveryType(order.getDeliveryInfo().getDeliveryType())
                .deliveryAddress(order.getDeliveryInfo().getAddress())
                .deliveryCity(order.getDeliveryInfo().getCity())
                .items(order.getItems().stream()
                        .map(OrderItemResponse::fromDomain)
                        .collect(Collectors.toList()))
                .subtotal(order.getSubtotal())
                .deliveryCost(order.getDeliveryCost())
                .total(order.getTotal())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .mercadoPagoPreferenceId(order.getMercadoPagoPreferenceId())
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private BigDecimal productPrice;
        private Integer quantity;
        private BigDecimal subtotal;

        public static OrderItemResponse fromDomain(OrderItem item) {
            return OrderItemResponse.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .productPrice(item.getProductPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .build();
        }
    }
}
