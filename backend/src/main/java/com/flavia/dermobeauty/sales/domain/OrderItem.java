package com.flavia.dermobeauty.sales.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Entity representing a single item in an order.
 * Part of the Order aggregate.
 */
@Getter
@AllArgsConstructor
@Builder
public class OrderItem {

    private Long id;
    private Long productId;
    private String productName;  // Snapshot at time of order
    private BigDecimal productPrice;  // Snapshot at time of order
    private Integer quantity;
    private BigDecimal subtotal;

    /**
     * Calculate subtotal based on price and quantity.
     */
    public static BigDecimal calculateSubtotal(BigDecimal price, Integer quantity) {
        if (price == null || quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Invalid price or quantity for order item");
        }
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    /**
     * Validate order item business rules.
     */
    public void validate() {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (productPrice == null || productPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product price must be greater than zero");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Subtotal cannot be negative");
        }
    }
}
