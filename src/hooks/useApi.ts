import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import type { PrayerTimes, CurrentPrayerInfo, City, HealthStatus } from '../types/prayer';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePrayerTimes(params: {
  city?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
}): UseApiState<PrayerTimes> {
  const [state, setState] = useState<UseApiState<PrayerTimes>>({
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const fetchData = useCallback(async () => {
    if (!params.city && (!params.latitude || !params.longitude)) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiClient.getPrayerTimes(params);
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat jadwal shalat';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [params.city, params.latitude, params.longitude, params.date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

export function useCurrentPrayer(
  latitude?: number,
  longitude?: number
): UseApiState<CurrentPrayerInfo> {
  const [state, setState] = useState<UseApiState<CurrentPrayerInfo>>({
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const fetchData = useCallback(async () => {
    if (latitude === undefined || longitude === undefined) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiClient.getCurrentPrayer(latitude, longitude);
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat info shalat saat ini';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

export function useCities(): UseApiState<City[]> {
  const [state, setState] = useState<UseApiState<City[]>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {},
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiClient.getCities();
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat daftar kota';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

export function useHealthCheck(): UseApiState<HealthStatus> {
  const [state, setState] = useState<UseApiState<HealthStatus>>({
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiClient.checkHealth();
      setState(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memeriksa status API';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

export function useAutoRefresh<T>(
  hook: () => UseApiState<T>,
  intervalMs: number = 60000
): UseApiState<T> {
  const result = hook();

  useEffect(() => {
    if (intervalMs <= 0) return;

    const interval = setInterval(() => {
      result.refetch();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [result.refetch, intervalMs]);

  return result;
}