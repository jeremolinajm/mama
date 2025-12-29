package com.flavia.dermobeauty.booking.infrastructure.persistence;

import com.flavia.dermobeauty.booking.domain.BookingHistory;
import com.flavia.dermobeauty.booking.domain.BookingHistoryRepository;
import com.flavia.dermobeauty.booking.infrastructure.mapper.BookingHistoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapter implementing BookingHistoryRepository using JPA.
 */
@Component
@RequiredArgsConstructor
public class BookingHistoryRepositoryAdapter implements BookingHistoryRepository {

    private final JpaBookingHistoryRepository jpaRepository;
    private final BookingHistoryMapper mapper;

    @Override
    public BookingHistory save(BookingHistory history) {
        BookingHistoryEntity entity = mapper.toEntity(history);
        BookingHistoryEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<BookingHistory> findByBookingId(Long bookingId) {
        return jpaRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingHistory> findByBookingIdOrderByCreatedAtAsc(Long bookingId) {
        return jpaRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
