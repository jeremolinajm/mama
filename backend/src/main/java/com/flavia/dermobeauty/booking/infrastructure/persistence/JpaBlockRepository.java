package com.flavia.dermobeauty.booking.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.BlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for BlockEntity.
 */
@Repository
public interface JpaBlockRepository extends JpaRepository<BlockEntity, Long> {

    Optional<BlockEntity> findByBlockNumber(String blockNumber);

    /**
     * Find blocks in a date range, optionally including cancelled.
     */
    @Query("SELECT b FROM BlockEntity b WHERE " +
            "b.startAt < :to AND b.endAt > :from " +
            "AND (:includeCancelled = true OR b.status != 'CANCELLED') " +
            "ORDER BY b.startAt ASC")
    List<BlockEntity> findByDateRange(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("includeCancelled") boolean includeCancelled);

    /**
     * Find active blocks that overlap with a time range.
     */
    @Query("SELECT b FROM BlockEntity b WHERE " +
            "b.status = 'ACTIVE' " +
            "AND b.startAt < :endAt AND b.endAt > :startAt")
    List<BlockEntity> findActiveBlocksInRange(
            @Param("startAt") OffsetDateTime startAt,
            @Param("endAt") OffsetDateTime endAt);

    /**
     * Check if any active block exists in a time range.
     */
    @Query("SELECT COUNT(b) > 0 FROM BlockEntity b WHERE " +
            "b.status = 'ACTIVE' " +
            "AND b.startAt < :endAt AND b.endAt > :startAt")
    boolean existsActiveBlockInRange(
            @Param("startAt") OffsetDateTime startAt,
            @Param("endAt") OffsetDateTime endAt);
}
