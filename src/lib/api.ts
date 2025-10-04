import type { PrayerTimes, CurrentPrayerInfo } from '../types/prayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getPrayerTimes(
  city?: string,
  date?: string
): Promise<PrayerTimes> {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (date) params.append('date', date);

  const response = await fetch(`${API_URL}/api/prayer-times?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch prayer times');
  }
  return response.json();
}

export async function getCurrentPrayer(
  latitude: number,
  longitude: number
): Promise<CurrentPrayerInfo> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  const response = await fetch(`${API_URL}/api/prayer-times/current?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch current prayer info');
  }
  return response.json();
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
