package com.flavia.dermobeauty.booking.web.dto;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Response DTO for block operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockResponse {

    private Long id;
    private String blockNumber;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private String reason;
    private BlockStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime cancelledAt;

    public static BlockResponse fromDomain(Block block) {
        return BlockResponse.builder()
                .id(block.getId())
                .blockNumber(block.getBlockNumber())
                .startAt(block.getStartAt())
                .endAt(block.getEndAt())
                .reason(block.getReason())
                .status(block.getStatus())
                .createdAt(block.getCreatedAt())
                .cancelledAt(block.getCancelledAt())
                .build();
    }
}
