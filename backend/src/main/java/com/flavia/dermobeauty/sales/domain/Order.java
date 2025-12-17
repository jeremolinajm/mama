package com.flavia.dermobeauty.sales.domain;

import com.flavia.dermobeauty.booking.domain.PaymentStatus;
import com.flavia.dermobeauty.shared.exception.DomainException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Order Aggregate Root.
 * Represents a product order with business rules enforcement.
 */
@Getter
@AllArgsConstructor
@Builder
public class Order {

    private Long id;
    private String orderNumber;
    private CustomerInfo customerInfo;
    private DeliveryInfo deliveryInfo;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal subtotal;
    private BigDecimal deliveryCost;
    private BigDecimal total;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String mercadoPagoPreferenceId;
    private String mercadoPagoPaymentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Add an item to the order.
     * Business rule: can only add items to PENDING orders.
     */
    public void addItem(OrderItem item) {
        if (this.status != OrderStatus.PENDING) {
            throw new DomainException("Cannot add items to order in status: " + status);
        }

        item.validate();
        this.items.add(item);
        recalculateTotal();
    }

    /**
     * Recalculate order totals based on items and delivery cost.
     */
    public void recalculateTotal() {
        this.subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryCostValue = deliveryCost != null ? deliveryCost : BigDecimal.ZERO;
        this.total = subtotal.add(deliveryCostValue);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Set delivery cost for the order.
     */
    public void setDeliveryCost(BigDecimal cost) {
        if (cost == null || cost.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Delivery cost cannot be negative");
        }
        this.deliveryCost = cost;
        recalculateTotal();
    }

    /**
     * Confirm payment for this order.
     * Business rule: can only confirm payment once, and only from PENDING status.
     */
    public void confirmPayment(String paymentId) {
        if (this.paymentStatus == PaymentStatus.PAID) {
            throw new DomainException("Payment already confirmed for order " + orderNumber);
        }

        if (this.status == OrderStatus.CANCELLED) {
            throw new DomainException("Cannot confirm payment for cancelled order " + orderNumber);
        }

        if (paymentId == null || paymentId.isBlank()) {
            throw new IllegalArgumentException("Payment ID cannot be empty");
        }

        this.mercadoPagoPaymentId = paymentId;
        this.paymentStatus = PaymentStatus.PAID;
        this.status = OrderStatus.PAID;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Update order status.
     * Business rule: cannot update cancelled or certain status transitions.
     */
    public void updateStatus(OrderStatus newStatus) {
        if (this.status == OrderStatus.CANCELLED) {
            throw new DomainException("Cannot update status of cancelled order " + orderNumber);
        }

        if (this.status == OrderStatus.DELIVERED && newStatus != OrderStatus.DELIVERED) {
            throw new DomainException("Cannot change status of delivered order " + orderNumber);
        }

        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Cancel this order.
     * Business rule: cannot cancel delivered orders.
     */
    public void cancel() {
        if (this.status == OrderStatus.CANCELLED) {
            throw new DomainException("Order " + orderNumber + " is already cancelled");
        }

        if (this.status == OrderStatus.DELIVERED) {
            throw new DomainException("Cannot cancel delivered order " + orderNumber);
        }

        this.status = OrderStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Get immutable copy of items list.
     */
    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    /**
     * Validate order business rules.
     */
    public void validate() {
        if (items == null || items.isEmpty()) {
            throw new DomainException("Order must have at least one item");
        }

        items.forEach(OrderItem::validate);

        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DomainException("Order subtotal must be greater than zero");
        }

        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new DomainException("Order total must be greater than zero");
        }
    }
}
