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
}

export interface CurrentPrayerInfo {
  current_prayer: string;
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
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  timezone: string;
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

export interface ApiError {
  error: string;
  code?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  time: string;
  database: 'connected' | 'disconnected';
  version: string;
  cities_count: number;
}