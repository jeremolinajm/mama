package com.flavia.dermobeauty.catalog.repository;

import com.flavia.dermobeauty.catalog.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for service operations with custom queries for filtering.
 */
@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    Optional<ServiceEntity> findBySlug(String slug);

    List<ServiceEntity> findByIsActiveTrueOrderByCreatedAtDesc();

    List<ServiceEntity> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT s FROM ServiceEntity s WHERE s.category.id = :categoryId AND s.isActive = true ORDER BY s.createdAt DESC")
    List<ServiceEntity> findByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId);
}
