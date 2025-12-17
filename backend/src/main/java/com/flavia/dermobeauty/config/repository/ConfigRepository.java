package com.flavia.dermobeauty.config.repository;

import com.flavia.dermobeauty.config.domain.ConfigEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConfigRepository extends JpaRepository<ConfigEntry, Long> {
    Optional<ConfigEntry> findByKey(String key);
}