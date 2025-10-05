import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { City } from '../types';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cities')
          .select('*')
          .order('name');

        if (fetchError) throw fetchError;

        setCities(data || []);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Gagal memuat daftar kota');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading, error };
}