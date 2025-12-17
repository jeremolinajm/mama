package com.flavia.dermobeauty.catalog.controller;

import com.flavia.dermobeauty.catalog.dto.ProductDto;
import com.flavia.dermobeauty.catalog.service.ProductCatalogService;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public REST controller for product catalog operations.
 * Provides endpoints for browsing available products.
 */
@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductCatalogService productCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        List<ProductDto> products = productCatalogService.getAllActive();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        List<ProductDto> products = productCatalogService.getFeatured();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getOfferProducts() {
        List<ProductDto> products = productCatalogService.getOffers();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getTrendingProducts() {
        List<ProductDto> products = productCatalogService.getTrending();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productCatalogService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        ProductDto product = productCatalogService.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductDto> products = productCatalogService.getByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}
