-- V14: Migrate BLOCKED bookings to blocks table and remove BLOCKED status

-- 1. Insert all BLOCKED bookings into blocks table
INSERT INTO blocks (block_number, reason, start_at, end_at, status, created_at, updated_at)
SELECT
    'BLOCK-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8)) as block_number,
    COALESCE(customer_comments, 'Migrado de sistema anterior') as reason,
    COALESCE(start_at, (booking_date + booking_time) AT TIME ZONE 'America/Argentina/Buenos_Aires') as start_at,
    -- For full-day blocks, end_at is start of next day; otherwise add duration
    CASE
        WHEN duration_minutes >= 600 THEN -- 10+ hours = likely full day block
            (COALESCE(start_at, (booking_date + booking_time) AT TIME ZONE 'America/Argentina/Buenos_Aires'))::date + INTERVAL '1 day'
        ELSE
            COALESCE(start_at, (booking_date + booking_time) AT TIME ZONE 'America/Argentina/Buenos_Aires')
            + (duration_minutes * INTERVAL '1 minute')
    END as end_at,
    'ACTIVE' as status,
    created_at,
    updated_at
FROM bookings
WHERE status = 'BLOCKED';

-- 2. Delete BLOCKED bookings from bookings table
DELETE FROM bookings WHERE status = 'BLOCKED';

-- 3. Drop and recreate status check constraint WITHOUT 'BLOCKED'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'));

-- 4. Update the collision trigger to NOT check for BLOCKED status
-- (since BLOCKED no longer exists in bookings table)
CREATE OR REPLACE FUNCTION check_booking_collision()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
    new_end_at TIMESTAMPTZ;
BEGIN
    -- Acquire advisory lock for serialization
    PERFORM pg_advisory_xact_lock(hashtext('booking_collision'));

    -- Calculate end time
    new_end_at := NEW.start_at + (NEW.duration_minutes * INTERVAL '1 minute');

    -- Only check if booking occupies time (PENDING or CONFIRMED)
    IF NEW.status NOT IN ('PENDING', 'CONFIRMED') THEN
        RETURN NEW;
    END IF;

    -- Check collision with other bookings that occupy time
    SELECT COUNT(*) INTO conflict_count
    FROM bookings b
    WHERE b.id IS DISTINCT FROM NEW.id
    AND b.status IN ('PENDING', 'CONFIRMED')
    AND b.start_at < new_end_at
    AND (b.start_at + (b.duration_minutes * INTERVAL '1 minute')) > NEW.start_at;

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied' USING ERRCODE = '23P01';
    END IF;

    -- Check collision with active blocks
    SELECT COUNT(*) INTO conflict_count
    FROM blocks bl
    WHERE bl.status = 'ACTIVE'
    AND bl.start_at < new_end_at
    AND bl.end_at > NEW.start_at;

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'slot_occupied' USING ERRCODE = '23P01';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Log migration
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count FROM blocks WHERE reason = 'Migrado de sistema anterior';
    RAISE NOTICE 'Migrated % BLOCKED bookings to blocks table', migrated_count;
END $$;
