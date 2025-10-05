import React from 'react';
import { PrayerCard } from './PrayerCard';
import { getPrayerInfoList } from '../utils/prayerUtils';
import type { PrayerTimes, CurrentPrayerInfo } from '../types/prayer';

interface PrayerTimesGridProps {
  prayerTimes: PrayerTimes;
  currentPrayerInfo?: CurrentPrayerInfo;
}

export function PrayerTimesGrid({ prayerTimes, currentPrayerInfo }: PrayerTimesGridProps) {
  const prayerInfoList = getPrayerInfoList(prayerTimes, currentPrayerInfo);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {prayerTimes.city || 'Jadwal Shalat'}
        </h2>
        <p className="text-gray-600 text-lg">
          {new Date(prayerTimes.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="text-sm text-gray-500 mt-1">
          {prayerTimes.latitude.toFixed(4)}, {prayerTimes.longitude.toFixed(4)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {prayerInfoList.map((prayer) => (
          <PrayerCard key={prayer.name} prayer={prayer} />
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          Waktu shalat dihitung menggunakan metode Kementerian Agama Indonesia
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}