-- Orders table for product purchases
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Customer information
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    customer_whatsapp VARCHAR(50) NOT NULL,

    -- Delivery information
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('PICKUP', 'HOME_DELIVERY')),
    delivery_address_street VARCHAR(300),
    delivery_address_city VARCHAR(100),
    delivery_address_state VARCHAR(100),
    delivery_address_postal_code VARCHAR(20),
    delivery_notes TEXT,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),

    -- Payment information
    mercadopago_preference_id VARCHAR(200),
    mercadopago_payment_id VARCHAR(200),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    delivered_at TIMESTAMP,

    CONSTRAINT chk_subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT chk_delivery_cost_non_negative CHECK (delivery_cost >= 0),
    CONSTRAINT chk_total_positive CHECK (total >= 0)
);

-- Indexes for performance
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_mp_payment ON orders(mercadopago_payment_id) WHERE mercadopago_payment_id IS NOT NULL;

-- Comments
COMMENT ON TABLE orders IS 'Product orders with delivery and payment tracking';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order reference (e.g., ORD-20241205-001)';
COMMENT ON COLUMN orders.delivery_type IS 'PICKUP: pickup at office, HOME_DELIVERY: delivery to address';
COMMENT ON COLUMN orders.subtotal IS 'Sum of all order items (before delivery cost)';
COMMENT ON COLUMN orders.total IS 'Final amount including delivery cost';
