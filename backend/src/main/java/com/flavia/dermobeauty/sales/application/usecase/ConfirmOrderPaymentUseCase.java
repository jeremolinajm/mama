package com.flavia.dermobeauty.sales.application.usecase;

import com.flavia.dermobeauty.sales.application.port.NotificationService;
import com.flavia.dermobeauty.sales.application.port.StockService;
import com.flavia.dermobeauty.sales.domain.Order;
import com.flavia.dermobeauty.sales.domain.OrderRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use Case: Confirm order payment.
 * Called from Mercado Pago webhook when payment is approved.
 * Decrements stock and sends confirmation email.
 */
@Slf4j
@RequiredArgsConstructor
public class ConfirmOrderPaymentUseCase {

    private final OrderRepository orderRepository;
    private final StockService stockService;
    private final NotificationService notificationService;

    public Order execute(String paymentId) {
        log.info("Confirming payment for payment ID: {}", paymentId);

        // Find order by payment ID
        Order order = orderRepository.findByMercadoPagoPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Order with payment ID '" + paymentId + "' not found"));

        // Confirm payment (domain logic)
        order.confirmPayment(paymentId);

        // Decrement stock for all items
        order.getItems().forEach(item -> {
            stockService.decrementStock(item.getProductId(), item.getQuantity());
            log.info("Decremented stock for product {}: {} units", item.getProductId(), item.getQuantity());
        });

        // Persist
        Order updated = orderRepository.save(order);
        log.info("Payment confirmed for order: {}", updated.getOrderNumber());

        // Send confirmation email (async, non-blocking)
        try {
            notificationService.sendOrderConfirmation(updated);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for {}", updated.getOrderNumber(), e);
            // Don't throw - email failure should not break payment confirmation
        }

        return updated;
    }
}
