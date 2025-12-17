package com.flavia.dermobeauty.catalog.dto;

import com.flavia.dermobeauty.catalog.entity.ServiceEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for service data transfer with validation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    private String shortDescription;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;

    private String imageUrl;

    private Boolean isFeatured;

    private Boolean isActive;

    public static ServiceDto fromEntity(ServiceEntity entity) {
        return ServiceDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .shortDescription(entity.getShortDescription())
                .durationMinutes(entity.getDurationMinutes())
                .price(entity.getPrice())
                .categoryId(entity.getCategory().getId())
                .categoryName(entity.getCategory().getName())
                .imageUrl(entity.getImageUrl())
                .isFeatured(entity.getIsFeatured())
                .isActive(entity.getIsActive())
                .build();
    }
}
