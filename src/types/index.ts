export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at?: string;
}

export interface PrayerTimes {
  id: string;
  city_id: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  created_at?: string;
}

export interface PrayerTimesWithCity extends PrayerTimes {
  cities: City;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerInfo {
  name: PrayerName;
  arabicName: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
}