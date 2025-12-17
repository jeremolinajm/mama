-- Services table for bookable beauty/dermatology treatments
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0),
    CONSTRAINT chk_price_positive CHECK (price >= 0)
);

-- Indexes
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_featured ON services(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_services_slug ON services(slug);

-- Comments
COMMENT ON TABLE services IS 'Beauty and dermatology services available for booking';
COMMENT ON COLUMN services.duration_minutes IS 'Duration of the service in minutes';
COMMENT ON COLUMN services.is_featured IS 'Whether to show this service on the homepage';
