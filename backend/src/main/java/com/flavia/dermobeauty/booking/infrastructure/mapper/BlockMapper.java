package com.flavia.dermobeauty.booking.infrastructure.mapper;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.infrastructure.persistence.BlockEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between Block domain entity and BlockEntity JPA entity.
 */
@Component
public class BlockMapper {

    /**
     * Converts a domain Block to a JPA BlockEntity.
     */
    public BlockEntity toEntity(Block block) {
        if (block == null) {
            return null;
        }

        return BlockEntity.builder()
                .id(block.getId())
                .blockNumber(block.getBlockNumber())
                .reason(block.getReason())
                .startAt(block.getStartAt())
                .endAt(block.getEndAt())
                .status(block.getStatus())
                .createdAt(block.getCreatedAt())
                .updatedAt(block.getUpdatedAt())
                .cancelledAt(block.getCancelledAt())
                .build();
    }

    /**
     * Converts a JPA BlockEntity to a domain Block.
     */
    public Block toDomain(BlockEntity entity) {
        if (entity == null) {
            return null;
        }

        return Block.builder()
                .id(entity.getId())
                .blockNumber(entity.getBlockNumber())
                .reason(entity.getReason())
                .startAt(entity.getStartAt())
                .endAt(entity.getEndAt())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .cancelledAt(entity.getCancelledAt())
                .build();
    }
}
