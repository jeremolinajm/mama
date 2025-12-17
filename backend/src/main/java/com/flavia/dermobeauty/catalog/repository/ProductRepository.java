package com.flavia.dermobeauty.catalog.repository;

import com.flavia.dermobeauty.catalog.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for product operations with custom queries for filtering.
 */
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    Optional<ProductEntity> findBySlug(String slug);

    List<ProductEntity> findByIsActiveTrueOrderByCreatedAtDesc();

    List<ProductEntity> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    List<ProductEntity> findByIsOfferTrueAndIsActiveTrueOrderByCreatedAtDesc();

    List<ProductEntity> findByIsTrendingTrueAndIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT p FROM ProductEntity p WHERE p.category.id = :categoryId AND p.isActive = true ORDER BY p.createdAt DESC")
    List<ProductEntity> findByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProductEntity p SET p.stock = p.stock - :quantity WHERE p.id = :id AND p.stock >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") Integer quantity);

}
