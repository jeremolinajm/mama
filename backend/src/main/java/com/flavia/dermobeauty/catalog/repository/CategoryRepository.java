package com.flavia.dermobeauty.catalog.repository;

import com.flavia.dermobeauty.catalog.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for category operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    Optional<CategoryEntity> findBySlug(String slug);

    List<CategoryEntity> findByType(CategoryEntity.CategoryType type);
}
