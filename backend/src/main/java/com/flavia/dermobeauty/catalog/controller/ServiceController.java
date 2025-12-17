package com.flavia.dermobeauty.catalog.controller;

import com.flavia.dermobeauty.catalog.dto.ServiceDto;
import com.flavia.dermobeauty.catalog.service.ServiceCatalogService;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public REST controller for service catalog operations.
 * Provides endpoints for browsing available services.
 */
@RestController
@RequestMapping("/api/public/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getAllServices() {
        List<ServiceDto> services = serviceCatalogService.getAllActive();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getFeaturedServices() {
        List<ServiceDto> services = serviceCatalogService.getFeatured();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceDto>> getServiceById(@PathVariable Long id) {
        ServiceDto service = serviceCatalogService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ServiceDto>> getServiceBySlug(@PathVariable String slug) {
        ServiceDto service = serviceCatalogService.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getServicesByCategory(@PathVariable Long categoryId) {
        List<ServiceDto> services = serviceCatalogService.getByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(services));
    }
}
