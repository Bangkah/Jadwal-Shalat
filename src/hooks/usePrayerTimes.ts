import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { City, PrayerTimes, PrayerTimesWithCity } from '../types';
import { format } from 'date-fns';

export function usePrayerTimes(selectedCity: string | null) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesWithCity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchPrayerTimes = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const { data, error: fetchError } = await supabase
          .from('prayer_times')
          .select(`
            *,
            cities (*)
          `)
          .eq('city_id', selectedCity)
          .eq('date', today)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No data found, try to generate prayer times
            await generatePrayerTimes(selectedCity, today);
            return;
          }
          throw fetchError;
        }

        setPrayerTimes(data as PrayerTimesWithCity);
      } catch (err) {
        console.error('Error fetching prayer times:', err);
        setError('Gagal memuat jadwal shalat');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  const generatePrayerTimes = async (cityId: string, date: string) => {
    try {
      // Get city data
      const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();

      if (cityError) throw cityError;

      // Calculate prayer times (simplified calculation)
      const prayerTimes = calculatePrayerTimes(city, date);

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('prayer_times')
        .insert({
          city_id: cityId,
          date,
          ...prayerTimes
        })
        .select(`
          *,
          cities (*)
        `)
        .single();

      if (insertError) throw insertError;

      setPrayerTimes(data as PrayerTimesWithCity);
    } catch (err) {
      console.error('Error generating prayer times:', err);
      setError('Gagal menghasilkan jadwal shalat');
    }
  };

  return { prayerTimes, loading, error };
}

// Simplified prayer time calculation
function calculatePrayerTimes(city: City, date: string): Omit<PrayerTimes, 'id' | 'city_id' | 'date' | 'created_at'> {
  // This is a simplified calculation. In a real app, you'd use a proper Islamic prayer time calculation library
  const baseHour = 6; // Starting from 6 AM
  
  return {
    fajr: '05:30:00',
    sunrise: '06:45:00',
    dhuhr: '12:15:00',
    asr: '15:30:00',
    maghrib: '18:45:00',
    isha: '20:00:00'
  };
}