package com.flavia.dermobeauty.sales.application.usecase;

import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import com.flavia.dermobeauty.catalog.entity.ProductEntity;
import com.flavia.dermobeauty.catalog.repository.ProductRepository;
import com.flavia.dermobeauty.sales.application.port.DeliveryCostCalculator;
import com.flavia.dermobeauty.sales.application.port.StockService;
import com.flavia.dermobeauty.sales.domain.*;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import com.flavia.dermobeauty.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Use Case: Create a new order.
 * Validates stock availability, calculates delivery cost, and creates order in PENDING status.
 */
@Slf4j
@RequiredArgsConstructor
public class CreateOrderUseCase {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;
    private final DeliveryCostCalculator deliveryCostCalculator;

    public Order execute(
            String customerName,
            String customerEmail,
            String customerWhatsapp,
            DeliveryType deliveryType,
            String deliveryAddress,
            String deliveryCity,
            String deliveryPostalCode,
            String deliveryProvince,
            String deliveryNotes,
            List<OrderItemRequest> itemRequests) {

        log.info("Creating order for customer: {}", customerEmail);

        // Validate stock availability for all items
        for (OrderItemRequest itemRequest : itemRequests) {
            if (!stockService.checkAvailability(itemRequest.productId, itemRequest.quantity)) {
                ProductEntity product = productRepository.findById(itemRequest.productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId));
                throw new ValidationException(
                        String.format("Insufficient stock for product '%s'. Requested: %d, Available: %d",
                                product.getName(), itemRequest.quantity, product.getStock())
                );
            }
        }

        // Create value objects
        CustomerInfo customerInfo = new CustomerInfo(customerName, customerEmail, customerWhatsapp);

        DeliveryInfo deliveryInfo = new DeliveryInfo(
                deliveryType,
                deliveryAddress,
                deliveryCity,
                deliveryPostalCode,
                deliveryProvince,
                deliveryNotes
        );

        // Calculate delivery cost
        BigDecimal deliveryCost = deliveryCostCalculator.calculate(deliveryType);

        // Create order aggregate
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerInfo(customerInfo)
                .deliveryInfo(deliveryInfo)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryCost(deliveryCost)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Add items to order
        for (OrderItemRequest itemRequest : itemRequests) {
            ProductEntity product = productRepository.findById(itemRequest.productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId));

            BigDecimal subtotal = OrderItem.calculateSubtotal(product.getPrice(), itemRequest.quantity);

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productPrice(product.getPrice())
                    .quantity(itemRequest.quantity)
                    .subtotal(subtotal)
                    .build();

            order.addItem(item);
        }

        // Validate and recalculate
        order.validate();
        order.recalculateTotal();

        // Persist
        Order saved = orderRepository.save(order);
        log.info("Order created successfully: {}", saved.getOrderNumber());

        return saved;
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        return "ORD-" + timestamp;
    }

    /**
     * DTO for order item request.
     */
    @RequiredArgsConstructor
    public static class OrderItemRequest {
        public final Long productId;
        public final Integer quantity;
    }
}
