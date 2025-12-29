-- Add offer_price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 2);

-- Add offer_price and is_offer columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_offer BOOLEAN NOT NULL DEFAULT FALSE;
