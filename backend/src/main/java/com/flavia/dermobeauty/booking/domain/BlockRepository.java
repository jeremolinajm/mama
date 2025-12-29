package com.flavia.dermobeauty.booking.domain;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository port for Block aggregate.
 * Defines the contract for block persistence operations.
 */
public interface BlockRepository {

    /**
     * Saves a block (create or update).
     */
    Block save(Block block);

    /**
     * Finds a block by its ID.
     */
    Optional<Block> findById(Long id);

    /**
     * Finds a block by its block number.
     */
    Optional<Block> findByBlockNumber(String blockNumber);

    /**
     * Finds all active blocks within a date range.
     * Used for calendar display.
     */
    List<Block> findByDateRange(OffsetDateTime from, OffsetDateTime to, boolean includeCancelled);

    /**
     * Finds all active blocks that overlap with a given time range.
     * Used for collision detection.
     */
    List<Block> findActiveBlocksInRange(OffsetDateTime startAt, OffsetDateTime endAt);

    /**
     * Checks if there's any active block that overlaps with the given time range.
     * Optimized for collision detection (returns early if any collision found).
     */
    boolean existsActiveBlockInRange(OffsetDateTime startAt, OffsetDateTime endAt);
}
