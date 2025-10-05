import React from 'react';
import type { PrayerInfo } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../utils/prayerUtils';

interface PrayerCardProps {
  prayer: PrayerInfo;
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  const cardClasses = `prayer-card ${
    prayer.isCurrent ? 'current-prayer' : prayer.isNext ? 'next-prayer' : ''
  }`;

  return (
    <div className={cardClasses}>
      <div className="text-center">
        <div className="prayer-name">
          {PRAYER_DISPLAY_NAMES[prayer.name]}
        </div>
        <div className="text-sm text-islamic-500 font-arabic mb-3">
          {prayer.arabicName}
        </div>
        <div className="prayer-time">
          {prayer.time}
        </div>
        {prayer.isCurrent && (
          <div className="mt-2 text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
            Waktu Sekarang
          </div>
        )}
        {prayer.isNext && (
          <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            Selanjutnya
          </div>
        )}
      </div>
    </div>
  );
}