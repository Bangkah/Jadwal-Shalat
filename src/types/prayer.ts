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
