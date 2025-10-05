-- Prayer Times Database Schema
-- PostgreSQL Schema for Prayer Times Application

-- Create database (run this separately if needed)
-- CREATE DATABASE prayer_times;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for caching prayer times
CREATE TABLE IF NOT EXISTS prayer_times_cache (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    fajr TIME NOT NULL,
    sunrise TIME NOT NULL,
    dhuhr TIME NOT NULL,
    asr TIME NOT NULL,
    maghrib TIME NOT NULL,
    isha TIME NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of date and location
    UNIQUE(date, latitude, longitude)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_cache_date_location 
ON prayer_times_cache(date, latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_prayer_cache_city 
ON prayer_times_cache(city);

CREATE INDEX IF NOT EXISTS idx_prayer_cache_created_at 
ON prayer_times_cache(created_at);

-- Optional: Create cities table for reference (if not using Supabase)
CREATE TABLE IF NOT EXISTS cities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Indonesia',
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for cities
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Insert sample Indonesian cities (optional)
INSERT INTO cities (name, latitude, longitude, timezone) VALUES
('Jakarta', -6.2088, 106.8456, 'Asia/Jakarta'),
('Bandung', -6.9175, 107.6191, 'Asia/Jakarta'),
('Surabaya', -7.2504, 112.7688, 'Asia/Jakarta'),
('Medan', 3.5952, 98.6722, 'Asia/Jakarta'),
('Banda Aceh', 5.5483, 95.3238, 'Asia/Jakarta'),
('Lhokseumawe', 5.1870, 97.1413, 'Asia/Jakarta'),
('Yogyakarta', -7.8014, 110.3647, 'Asia/Jakarta'),
('Makassar', -5.1477, 119.4327, 'Asia/Makassar'),
('Denpasar', -8.65, 115.2167, 'Asia/Makassar'),
('Palembang', -2.9909, 104.7566, 'Asia/Jakarta'),
('Semarang', -6.9667, 110.4167, 'Asia/Jakarta'),
('Balikpapan', -1.2654, 116.8312, 'Asia/Makassar'),
('Jayapura', -2.5337, 140.7181, 'Asia/Jayapura'),
('Pontianak', 0.0263, 109.3425, 'Asia/Jakarta'),
('Padang', -0.9471, 100.4172, 'Asia/Jakarta'),
('Pekanbaru', 0.5071, 101.4478, 'Asia/Jakarta'),
('Banjarmasin', -3.3194, 114.5906, 'Asia/Makassar'),
('Manado', 1.4748, 124.8421, 'Asia/Makassar'),
('Kupang', -10.1718, 123.6075, 'Asia/Makassar'),
('Ambon', -3.6954, 128.1814, 'Asia/Jayapura')
ON CONFLICT DO NOTHING;

-- Create prayer_times table with foreign key to cities (optional)
CREATE TABLE IF NOT EXISTS prayer_times (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    fajr TIME NOT NULL,
    sunrise TIME NOT NULL,
    dhuhr TIME NOT NULL,
    asr TIME NOT NULL,
    maghrib TIME NOT NULL,
    isha TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(city_id, date)
);

-- Create indexes for prayer_times
CREATE INDEX IF NOT EXISTS idx_prayer_times_city_date 
ON prayer_times(city_id, date);

-- Enable Row Level Security (if using Supabase)
-- ALTER TABLE prayer_times_cache ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (if using Supabase)
-- CREATE POLICY "Anyone can read prayer times" ON prayer_times_cache FOR SELECT TO public USING (true);
-- CREATE POLICY "Anyone can read cities" ON cities FOR SELECT TO public USING (true);
-- CREATE POLICY "Anyone can read prayer times" ON prayer_times FOR SELECT TO public USING (true);

-- Create policies for authenticated users (if using Supabase)
-- CREATE POLICY "Authenticated users can insert prayer times" ON prayer_times_cache FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Authenticated users can update prayer times" ON prayer_times_cache FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Function to clean old cache entries (optional)
CREATE OR REPLACE FUNCTION clean_old_prayer_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM prayer_times_cache 
    WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old cache (optional, requires pg_cron extension)
-- SELECT cron.schedule('clean-prayer-cache', '0 2 * * *', 'SELECT clean_old_prayer_cache();');

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON prayer_times_cache TO your_app_user;
-- GRANT SELECT ON cities TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON prayer_times TO your_app_user;

-- Comments for documentation
COMMENT ON TABLE prayer_times_cache IS 'Cache table for prayer times calculations';
COMMENT ON TABLE cities IS 'Reference table for Indonesian cities';
COMMENT ON TABLE prayer_times IS 'Prayer times linked to specific cities';

COMMENT ON COLUMN prayer_times_cache.latitude IS 'Latitude in decimal degrees';
COMMENT ON COLUMN prayer_times_cache.longitude IS 'Longitude in decimal degrees';
COMMENT ON COLUMN prayer_times_cache.city IS 'City name for reference';

-- Verify tables were created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('prayer_times_cache', 'cities', 'prayer_times')
ORDER BY table_name;