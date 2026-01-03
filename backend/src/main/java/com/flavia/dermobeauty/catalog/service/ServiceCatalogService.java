package com.flavia.dermobeauty.catalog.service;

import com.flavia.dermobeauty.catalog.dto.ServiceDto;
import com.flavia.dermobeauty.catalog.entity.CategoryEntity;
import com.flavia.dermobeauty.catalog.entity.ServiceEntity;
import com.flavia.dermobeauty.catalog.repository.CategoryRepository;
import com.flavia.dermobeauty.catalog.repository.ServiceRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing service catalog operations.
 * Provides CRUD operations for beauty/dermatology services.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ServiceDto> getAllActive() {
        log.debug("Fetching all active services");
        return serviceRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getAllForAdmin() {
        log.debug("Fetching all services for admin");
        return serviceRepository.findAll()
                .stream()
                .map(ServiceDto::fromEntity)
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getFeatured() {
        log.debug("Fetching featured services");
        return serviceRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getOffers() {
        log.debug("Fetching services on offer");
        return serviceRepository.findByIsOfferTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceDto getById(Long id) {
        log.debug("Fetching service by id: {}", id);
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        return ServiceDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public ServiceDto getBySlug(String slug) {
        log.debug("Fetching service by slug: {}", slug);
        ServiceEntity entity = serviceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Service with slug '" + slug + "' not found"));
        return ServiceDto.fromEntity(entity);
    }

    @Transactional(readOnly = true)
    public List<ServiceDto> getByCategory(Long categoryId) {
        log.debug("Fetching services by category: {}", categoryId);
        return serviceRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceDto create(ServiceDto dto) {
        log.info("Creating new service: {}", dto.getName());

        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));

        ServiceEntity entity = ServiceEntity.builder()
                .name(dto.getName())
                .slug(generateSlug(dto.getName()))
                .description(dto.getDescription())
                .shortDescription(dto.getShortDescription())
                .durationMinutes(dto.getDurationMinutes())
                .price(dto.getPrice())
                .offerPrice(dto.getOfferPrice())
                .isOffer(dto.getIsOffer() != null ? dto.getIsOffer() : false)
                .category(category)
                .imageUrl(dto.getImageUrl())
                .isFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        ServiceEntity saved = serviceRepository.save(entity);
        return ServiceDto.fromEntity(saved);
    }

    @Transactional
    public ServiceDto update(Long id, ServiceDto dto) {
        log.info("Updating service: {}", id);

        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(entity.getCategory().getId())) {
            CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            entity.setCategory(category);
        }

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setShortDescription(dto.getShortDescription());
        entity.setDurationMinutes(dto.getDurationMinutes());
        entity.setPrice(dto.getPrice());
        entity.setOfferPrice(dto.getOfferPrice());
        entity.setIsOffer(dto.getIsOffer());
        entity.setImageUrl(dto.getImageUrl());
        entity.setIsFeatured(dto.getIsFeatured());
        entity.setIsActive(dto.getIsActive());

        ServiceEntity updated = serviceRepository.save(entity);
        return ServiceDto.fromEntity(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting service: {}", id);
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service", id);
        }
        serviceRepository.deleteById(id);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
