import { format, parse } from 'date-fns';
import type { PrayerTimes, PrayerName, PrayerInfo, CurrentPrayerInfo } from '../types/prayer';

export const PRAYER_NAMES: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

export const PRAYER_DISPLAY_NAMES: Record<PrayerName, string> = {
  fajr: 'Subuh',
  sunrise: 'Terbit',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya'
};

export function getCurrentAndNextPrayer(prayerTimes: PrayerTimes): {
  current: PrayerName | null;
  next: PrayerName | null;
} {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  let current: PrayerName | null = null;
  let next: PrayerName | null = null;
  
  for (let i = 0; i < prayers.length; i++) {
    const prayerName = prayers[i];
    const prayerTime = formatPrayerTime(prayerTimes[prayerName]);
    
    if (currentTime >= prayerTime) {
      current = prayerName;
    } else {
      next = prayerName;
      break;
    }
  }
  
  // If we're past Isha, next prayer is Fajr tomorrow
  if (!next && current === 'isha') {
    next = 'fajr';
  }
  
  return { current, next };
}

export function formatPrayerTime(time: string): string {
  try {
    // Handle both HH:mm and HH:mm:ss formats
    const timeParts = time.split(':');
    if (timeParts.length >= 2) {
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return time;
  } catch {
    return time;
  }
}

export function getPrayerInfoList(
  prayerTimes: PrayerTimes, 
  currentPrayerInfo?: CurrentPrayerInfo
): PrayerInfo[] {
  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  // Use API current prayer info if available, otherwise calculate locally
  let currentPrayer: string | null = null;
  let nextPrayer: string | null = null;
  
  if (currentPrayerInfo) {
    currentPrayer = currentPrayerInfo.current_prayer?.toLowerCase() || null;
    nextPrayer = currentPrayerInfo.next_prayer?.toLowerCase() || null;
  } else {
    const { current, next } = getCurrentAndNextPrayer(prayerTimes);
    currentPrayer = current;
    nextPrayer = next;
  }
  
  return prayers.map(prayerName => ({
    name: prayerName,
    arabicName: PRAYER_NAMES[prayerName],
    displayName: PRAYER_DISPLAY_NAMES[prayerName],
    time: formatPrayerTime(prayerTimes[prayerName]),
    isCurrent: currentPrayer === prayerName,
    isNext: nextPrayer === prayerName
  }));
}

export function calculateTimeUntilPrayer(prayerTime: string): string {
  try {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    
    // If prayer time has passed today, set it for tomorrow
    if (prayerDate <= now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diff = prayerDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft} jam ${minutesLeft} menit`;
    } else {
      return `${minutesLeft} menit`;
    }
  } catch {
    return 'Tidak diketahui';
  }
}

export function isCurrentPrayerTime(prayerTime: string, toleranceMinutes: number = 15): boolean {
  try {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    
    const diff = Math.abs(now.getTime() - prayerDate.getTime());
    const diffMinutes = diff / (1000 * 60);
    
    return diffMinutes <= toleranceMinutes;
  } catch {
    return false;
  }
}

export function getNextPrayerCountdown(prayerTimes: PrayerTimes): {
  nextPrayer: PrayerName;
  countdown: string;
} {
  const { next } = getCurrentAndNextPrayer(prayerTimes);
  const nextPrayerName = next || 'fajr';
  const nextPrayerTime = prayerTimes[nextPrayerName];
  const countdown = calculateTimeUntilPrayer(nextPrayerTime);
  
  return {
    nextPrayer: nextPrayerName,
    countdown
  };
}