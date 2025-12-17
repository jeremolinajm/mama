package com.flavia.dermobeauty.sales.application.port;

/**
 * Port (interface) for stock management operations.
 * Will be implemented by the catalog infrastructure.
 */
public interface StockService {

    /**
     * Check if sufficient stock is available for a product.
     *
     * @param productId Product ID
     * @param quantity  Requested quantity
     * @return true if stock available, false otherwise
     */
    boolean checkAvailability(Long productId, Integer quantity);

    /**
     * Decrement stock for a product.
     * Should be called after payment confirmation.
     *
     * @param productId Product ID
     * @param quantity  Quantity to decrement
     */
    void decrementStock(Long productId, Integer quantity);
}
