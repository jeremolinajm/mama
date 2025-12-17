-- Bookings table for service appointments
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    service_id BIGINT NOT NULL REFERENCES services(id),

    -- Customer information
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    customer_whatsapp VARCHAR(50) NOT NULL,
    customer_comments TEXT,

    -- Booking details
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),

    -- Payment information
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    mercadopago_preference_id VARCHAR(200),
    mercadopago_payment_id VARCHAR(200),
    amount DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    CONSTRAINT chk_amount_positive CHECK (amount >= 0)
);

-- Indexes for performance
CREATE INDEX idx_bookings_number ON bookings(booking_number);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_mp_payment ON bookings(mercadopago_payment_id) WHERE mercadopago_payment_id IS NOT NULL;

-- Prevent double-booking: same service, date, and time (excluding cancelled bookings)
CREATE UNIQUE INDEX idx_bookings_unique_slot ON bookings(service_id, booking_date, booking_time)
    WHERE status != 'CANCELLED';

-- Comments
COMMENT ON TABLE bookings IS 'Service appointments/bookings with payment tracking';
COMMENT ON COLUMN bookings.booking_number IS 'Human-readable booking reference (e.g., BOOK-20241205-001)';
COMMENT ON COLUMN bookings.mercadopago_preference_id IS 'Mercado Pago preference ID for payment';
COMMENT ON COLUMN bookings.mercadopago_payment_id IS 'Mercado Pago payment ID after successful payment';
-- Note: idx_bookings_unique_slot is a unique index that prevents double-booking the same time slot
