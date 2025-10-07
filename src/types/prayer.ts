export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  latitude: number;
  longitude: number;
  city?: string;
  timezone?: string;
}

export interface CurrentPrayerInfo {
  current_prayer: string | null;
  next_prayer: string;
  time_until_next: string;
  prayer_times: PrayerTimes;
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface City {
  id: number;
  name: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerInfo {
  name: PrayerName;
  arabicName: string;
  displayName: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  time: string;
  version: string;
  database: 'connected' | 'disconnected';
  cities_count: number;
  cache: 'working' | 'failed';
}