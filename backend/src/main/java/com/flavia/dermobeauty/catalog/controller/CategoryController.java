package com.flavia.dermobeauty.catalog.controller;

import com.flavia.dermobeauty.catalog.dto.CategoryDto;
import com.flavia.dermobeauty.catalog.entity.CategoryEntity;
import com.flavia.dermobeauty.catalog.repository.CategoryRepository;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Public REST controller for category operations.
 * Provides endpoints for browsing categories.
 */
@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryRepository.findAll()
                .stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategoriesByType(@PathVariable CategoryEntity.CategoryType type) {
        List<CategoryDto> categories = categoryRepository.findByType(type)
                .stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
