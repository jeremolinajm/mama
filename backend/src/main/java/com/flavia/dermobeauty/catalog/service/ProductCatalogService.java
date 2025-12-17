package com.flavia.dermobeauty.catalog.service;

import com.flavia.dermobeauty.catalog.dto.ProductDto;
import com.flavia.dermobeauty.catalog.entity.CategoryEntity;
import com.flavia.dermobeauty.catalog.entity.ProductEntity;
import com.flavia.dermobeauty.catalog.repository.CategoryRepository;
import com.flavia.dermobeauty.catalog.repository.ProductRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing product catalog operations.
 * Provides CRUD operations for beauty/dermatology products.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> getAllActive() {
        log.debug("Fetching all active products");
        return productRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllForAdmin() {
        log.debug("Fetching all products for admin");
        // Usamos findAll() estándar de JPA para traer todo
        return productRepository.findAll()
                .stream()
                .map(ProductDto::fromEntity)
                // Ordenamos por ID o fecha para que no salten en la tabla
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getAllForAdminPaginated(Pageable pageable) {
        log.debug("Fetching products for admin with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findAll(pageable)
                .map(ProductDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeatured() {
        log.debug("Fetching featured products");
        return productRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getOffers() {
        log.debug("Fetching products on offer");
        return productRepository.findByIsOfferTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTrending() {
        log.debug("Fetching trending products");
        return productRepository.findByIsTrendingTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        log.debug("Fetching product by id: {}", id);
        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return ProductDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        log.debug("Fetching product by slug: {}", slug);
        ProductEntity entity = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product with slug '" + slug + "' not found"));
        return ProductDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getByCategory(Long categoryId) {
        log.debug("Fetching products by category: {}", categoryId);
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto create(ProductDto dto) {
        log.info("Creating new product: {}", dto.getName());

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));

        ProductEntity entity = ProductEntity.builder()
                .name(dto.getName())
                .slug(generateSlug(dto.getName()))
                .description(dto.getDescription())
                .shortDescription(dto.getShortDescription())
                .price(dto.getPrice())
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .category(category)
                .imageUrl(dto.getImageUrl())
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .isOffer(dto.getIsOffer() != null ? dto.getIsOffer() : false)
                .isTrending(dto.getIsTrending() != null ? dto.getIsTrending() : false)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        ProductEntity saved = productRepository.save(entity);
        return ProductDto.fromEntity(saved);
    }

    @Transactional
    public ProductDto update(Long id, ProductDto dto) {
        log.info("Updating product: {}", id);

        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(entity.getCategory().getId())) {
            CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            entity.setCategory(category);
        }

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setShortDescription(dto.getShortDescription());
        entity.setPrice(dto.getPrice());
        entity.setStock(dto.getStock());
        entity.setImageUrl(dto.getImageUrl());
        entity.setIsFeatured(dto.getIsFeatured());
        entity.setIsOffer(dto.getIsOffer());
        entity.setIsTrending(dto.getIsTrending());
        entity.setIsActive(dto.getIsActive());

        ProductEntity updated = productRepository.save(entity);
        return ProductDto.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting product: {}", id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
