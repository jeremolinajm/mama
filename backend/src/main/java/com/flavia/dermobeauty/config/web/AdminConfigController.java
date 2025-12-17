package com.flavia.dermobeauty.config.web;

import com.flavia.dermobeauty.config.domain.ConfigEntry;
import com.flavia.dermobeauty.config.repository.ConfigRepository;
import com.flavia.dermobeauty.shared.web.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
public class AdminConfigController {

    private final ConfigRepository configRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConfigEntry>>> getAllConfig() {
        return ResponseEntity.ok(ApiResponse.success(configRepository.findAll()));
    }

    @PutMapping("/{key}")
    public ResponseEntity<ApiResponse<ConfigEntry>> updateConfig(
            @PathVariable String key,
            @RequestBody UpdateConfigRequest request) {

        ConfigEntry config = configRepository.findByKey(key)
                .orElse(ConfigEntry.builder().key(key).build());

        config.setValue(request.getValue());
        // Descripción opcional, solo si es nuevo
        if (config.getDescription() == null) {
            config.setDescription("Configuración dinámica");
        }

        return ResponseEntity.ok(ApiResponse.success(configRepository.save(config)));
    }

    @Data
    public static class UpdateConfigRequest {
        private String value;
    }
}