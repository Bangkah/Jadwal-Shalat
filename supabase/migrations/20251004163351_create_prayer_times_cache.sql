/*
  # Prayer Times Cache Table

  1. New Tables
    - `prayer_times_cache`
      - `id` (uuid, primary key) - Unique identifier for each cache entry
      - `date` (date) - The date for which prayer times are calculated
      - `fajr` (text) - Fajr prayer time in HH:MM format
      - `sunrise` (text) - Sunrise time in HH:MM format
      - `dhuhr` (text) - Dhuhr prayer time in HH:MM format
      - `asr` (text) - Asr prayer time in HH:MM format
      - `maghrib` (text) - Maghrib prayer time in HH:MM format
      - `isha` (text) - Isha prayer time in HH:MM format
      - `latitude` (numeric) - Latitude coordinate of the location
      - `longitude` (numeric) - Longitude coordinate of the location
      - `created_at` (timestamptz) - When this cache entry was created
      
  2. Indexes
    - Composite index on (date, latitude, longitude) for efficient cache lookups
    
  3. Security
    - Enable RLS on `prayer_times_cache` table
    - Add policy for public read access (prayer times are public information)
    - Add policy for API service to write cache entries
    
  4. Notes
    - This table serves as a cache to reduce computation overhead
    - Cache entries older than 7 days are considered stale
    - Unique constraint ensures no duplicate entries for same location and date
*/

CREATE TABLE IF NOT EXISTS prayer_times_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  fajr text NOT NULL,
  sunrise text NOT NULL,
  dhuhr text NOT NULL,
  asr text NOT NULL,
  maghrib text NOT NULL,
  isha text NOT NULL,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, latitude, longitude)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_prayer_times_location_date 
  ON prayer_times_cache(date, latitude, longitude);

-- Enable Row Level Security
ALTER TABLE prayer_times_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (prayer times are public information)
CREATE POLICY "Anyone can read prayer times"
  ON prayer_times_cache
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update cache entries
CREATE POLICY "Authenticated users can insert prayer times"
  ON prayer_times_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prayer times"
  ON prayer_times_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
