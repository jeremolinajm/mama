package com.flavia.dermobeauty.sales.infrastructure.stock;

import com.flavia.dermobeauty.catalog.repository.ProductRepository;
import com.flavia.dermobeauty.sales.application.port.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of StockService using product repository.
 * Manages product stock levels with pessimistic locking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, Integer quantity) {
        return productRepository.findById(productId)
                .map(p -> p.getStock() >= quantity)
                .orElse(false);
    }

    @Override
    @Transactional
    public void decrementStock(Long productId, Integer quantity) {
        int updatedRows = productRepository.decrementStock(productId, quantity);

        if (updatedRows == 0) {
             log.error("Stock update failed for product {}. Requested: {}", productId, quantity);
            throw new IllegalStateException("No hay stock suficiente para completar la operación o el producto no existe.");
        }

        log.info("Decremented stock for product {}: -{} units", productId, quantity);
    }
}