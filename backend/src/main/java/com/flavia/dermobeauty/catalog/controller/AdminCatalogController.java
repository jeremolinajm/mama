package com.flavia.dermobeauty.catalog.controller;

import com.flavia.dermobeauty.catalog.dto.CategoryDto;
import com.flavia.dermobeauty.catalog.dto.ProductDto;
import com.flavia.dermobeauty.catalog.dto.ServiceDto;
import com.flavia.dermobeauty.catalog.entity.CategoryEntity;
import com.flavia.dermobeauty.catalog.repository.CategoryRepository;
import com.flavia.dermobeauty.catalog.service.ProductCatalogService;
import com.flavia.dermobeauty.catalog.service.ServiceCatalogService;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final ServiceCatalogService serviceService;
    private final ProductCatalogService productService;
    private final CategoryRepository categoryRepository;

    // ==================== SERVICES ====================

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(serviceService.getAllForAdmin()));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceDto>> getService(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceService.getById(id)));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ServiceDto>> createService(@Valid @RequestBody ServiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(serviceService.create(dto), "Servicio creado"));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceDto>> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDto dto) {
        return ResponseEntity.ok(ApiResponse.success(serviceService.update(id, dto), "Servicio actualizado"));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Servicio eliminado"));
    }

    @PatchMapping("/services/{id}/featured")
    public ResponseEntity<ApiResponse<ServiceDto>> toggleServiceFeatured(@PathVariable Long id) {
        // Obtenemos actual, invertimos flag y guardamos
        ServiceDto current = serviceService.getById(id);
        current.setIsFeatured(!current.getIsFeatured());
        return ResponseEntity.ok(ApiResponse.success(serviceService.update(id, current)));
    }

    // ==================== PRODUCTS ====================

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ProductDto> products = productService.getAllForAdminPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success(productService.create(dto), "Producto creado"));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, dto), "Producto actualizado"));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Producto eliminado"));
    }

    @PatchMapping("/products/{id}/featured")
    public ResponseEntity<ApiResponse<ProductDto>> toggleProductFeatured(@PathVariable Long id) {
        ProductDto current = productService.getById(id);
        current.setIsFeatured(!current.getIsFeatured());
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, current)));
    }

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryRepository.findAll().stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@RequestBody CategoryEntity category) {
        // Simplificación: Guardamos directo la entidad (mejorar con DTO/Service en futuro)
        // Generar slug simple
        category.setSlug(category.getName().toLowerCase().replace(" ", "-"));
        CategoryEntity saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(CategoryDto.fromEntity(saved)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Categoría eliminada"));
    }
}