package com.flavia.dermobeauty.catalog.dto;

import com.flavia.dermobeauty.catalog.entity.ProductEntity;
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
 * DTO for product data transfer with validation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    private String shortDescription;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;

    private String imageUrl;

    private Boolean isFeatured;

    private Boolean isOffer;

    private Boolean isTrending;

    private Boolean isActive;

    public static ProductDto fromEntity(ProductEntity entity) {
        return ProductDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .shortDescription(entity.getShortDescription())
                .price(entity.getPrice())
                .stock(entity.getStock())
                .categoryId(entity.getCategory().getId())
                .categoryName(entity.getCategory().getName())
                .imageUrl(entity.getImageUrl())
                .isFeatured(entity.getIsFeatured())
                .isOffer(entity.getIsOffer())
                .isTrending(entity.getIsTrending())
                .isActive(entity.getIsActive())
                .build();
    }
}
