package com.flavia.dermobeauty.booking.application.usecase;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Use case for cancelling a block.
 * Marks the block as CANCELLED (soft delete).
 */
@SuppressWarnings("ClassCanBeRecord")
@Slf4j
@RequiredArgsConstructor
public class CancelBlockUseCase {

    private final BlockRepository blockRepository;

    /**
     * Cancels a block by ID.
     *
     * @param blockId the ID of the block to cancel
     * @return the cancelled block
     * @throws ResourceNotFoundException if block not found
     */
    public Block execute(Long blockId) {
        log.info("Cancelling block with ID: {}", blockId);

        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Block", blockId));

        block.cancel();

        Block saved = blockRepository.save(block);
        log.info("Block cancelled successfully: {}", saved.getBlockNumber());

        return saved;
    }
}
