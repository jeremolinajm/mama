-- Products table for beauty/dermatology products sold via e-commerce
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id BIGINT REFERENCES categories(id),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_offer BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_stock_non_negative CHECK (stock >= 0),
    CONSTRAINT chk_price_positive CHECK (price >= 0)
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_trending ON products(is_trending) WHERE is_trending = TRUE;
CREATE INDEX idx_products_offer ON products(is_offer) WHERE is_offer = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_slug ON products(slug);

-- Comments
COMMENT ON TABLE products IS 'Beauty and dermatology products available for purchase';
COMMENT ON COLUMN products.stock IS 'Available inventory (decremented on confirmed orders)';
COMMENT ON COLUMN products.is_featured IS 'Whether to show this product on the homepage';
COMMENT ON COLUMN products.is_offer IS 'Whether this product is currently on sale/offer';
COMMENT ON COLUMN products.is_trending IS 'Whether this product is marked as trending';
