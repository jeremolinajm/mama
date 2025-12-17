-- Application configuration table (key-value store)
CREATE TABLE app_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_config_key ON app_config(config_key);

-- Comments
COMMENT ON TABLE app_config IS 'Application configuration settings (editable via admin panel)';
COMMENT ON COLUMN app_config.config_key IS 'Unique configuration key (e.g., site.name, delivery.fixed_cost)';
COMMENT ON COLUMN app_config.config_value IS 'Configuration value as text (parse as needed)';
