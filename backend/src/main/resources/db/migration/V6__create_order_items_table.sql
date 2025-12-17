-- Order items table for products in each order
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),

    -- Snapshot of product at time of order (preserves historical data)
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,

    -- Quantity and pricing
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_product_price_non_negative CHECK (product_price >= 0),
    CONSTRAINT chk_subtotal_non_negative CHECK (subtotal >= 0)
);

-- Indexes for performance
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Comments
COMMENT ON TABLE order_items IS 'Line items for each order with product snapshot';
COMMENT ON COLUMN order_items.product_name IS 'Product name at time of order (snapshot for history)';
COMMENT ON COLUMN order_items.product_price IS 'Product price at time of order (snapshot for history)';
COMMENT ON COLUMN order_items.subtotal IS 'Calculated as quantity * product_price';
