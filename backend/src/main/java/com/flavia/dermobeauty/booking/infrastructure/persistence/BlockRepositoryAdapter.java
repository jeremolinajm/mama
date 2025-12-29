package com.flavia.dermobeauty.booking.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.Block;
import com.flavia.dermobeauty.booking.domain.BlockRepository;
import com.flavia.dermobeauty.booking.infrastructure.mapper.BlockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter implementing BlockRepository using JPA.
 */
@Component
@RequiredArgsConstructor
public class BlockRepositoryAdapter implements BlockRepository {

    private final JpaBlockRepository jpaRepository;
    private final BlockMapper mapper;

    @Override
    public Block save(Block block) {
        BlockEntity entity = mapper.toEntity(block);
        BlockEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Block> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Block> findByBlockNumber(String blockNumber) {
        return jpaRepository.findByBlockNumber(blockNumber)
                .map(mapper::toDomain);
    }

    @Override
    public List<Block> findByDateRange(OffsetDateTime from, OffsetDateTime to, boolean includeCancelled) {
        return jpaRepository.findByDateRange(from, to, includeCancelled)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Block> findActiveBlocksInRange(OffsetDateTime startAt, OffsetDateTime endAt) {
        return jpaRepository.findActiveBlocksInRange(startAt, endAt)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsActiveBlockInRange(OffsetDateTime startAt, OffsetDateTime endAt) {
        return jpaRepository.existsActiveBlockInRange(startAt, endAt);
    }
}
