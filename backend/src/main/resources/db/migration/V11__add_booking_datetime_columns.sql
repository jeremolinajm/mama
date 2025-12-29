-- V11: Add start_at and service_name to bookings
-- Also update status CHECK to include BLOCKED (backward compatibility during migration)

-- 1. Add new columns (nullable initially for migration)
ALTER TABLE bookings ADD COLUMN start_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN service_name VARCHAR(200);

-- 2. Populate start_at from booking_date + booking_time (assume Buenos Aires timezone)
UPDATE bookings
SET start_at = (booking_date + booking_time) AT TIME ZONE 'America/Argentina/Buenos_Aires';

-- 3. Populate service_name from services table
UPDATE bookings b
SET service_name = s.name
FROM services s
WHERE b.service_id = s.id;

-- 4. Make start_at NOT NULL (service_name can be null for BLOCKED bookings)
ALTER TABLE bookings ALTER COLUMN start_at SET NOT NULL;

-- 5. Update status CHECK constraint to include BLOCKED
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'BLOCKED'));

-- 6. Fix existing duration_minutes to be multiples of 30 (round up)
-- e.g., 45 -> 60, 50 -> 60
UPDATE bookings
SET duration_minutes = CEIL(duration_minutes::numeric / 30) * 30
WHERE duration_minutes % 30 != 0;

-- Also fix services table durations
UPDATE services
SET duration_minutes = CEIL(duration_minutes::numeric / 30) * 30
WHERE duration_minutes % 30 != 0;

-- 7. Add constraint for slot alignment (30 min intervals)
ALTER TABLE bookings ADD CONSTRAINT chk_booking_aligned_start
    CHECK (EXTRACT(MINUTE FROM start_at) IN (0, 30));

-- 8. Add constraint for duration (multiple of 30)
ALTER TABLE bookings ADD CONSTRAINT chk_booking_duration_aligned
    CHECK (duration_minutes > 0 AND duration_minutes % 30 = 0);

-- 9. Indexes for new columns
CREATE INDEX idx_bookings_start_at ON bookings(start_at);

-- Partial index for bookings that "occupy" time slots (for collision queries)
CREATE INDEX idx_bookings_occupying ON bookings(start_at, duration_minutes)
    WHERE status IN ('PENDING', 'CONFIRMED');

-- Comments
COMMENT ON COLUMN bookings.start_at IS 'Booking start time with timezone (TIMESTAMPTZ). Replaces booking_date + booking_time.';
COMMENT ON COLUMN bookings.service_name IS 'Snapshot of service name at booking creation (immutable for historical accuracy)';
