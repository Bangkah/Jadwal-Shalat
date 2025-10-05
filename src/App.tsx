import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Header } from './components/Header';
import { LocationSelector } from './components/LocationSelector';
import { PrayerTimesGrid } from './components/PrayerTimesGrid';
import { ApiStatus } from './components/ApiStatus';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { usePrayerTimes, useCurrentPrayer, useAutoRefresh } from './hooks/useApi';
import type { Location } from './types/prayer';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [location, setLocation] = useState<Location>({
    latitude: 5.1870,
    longitude: 97.1413,
    city: 'Lhokseumawe',
  });

  // Auto-refresh prayer times every 5 minutes
  const prayerTimesResult = useAutoRefresh(
    () => usePrayerTimes({
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
    }),
    5 * 60 * 1000 // 5 minutes
  );

  // Auto-refresh current prayer info every minute
  const currentPrayerResult = useAutoRefresh(
    () => useCurrentPrayer(location.latitude, location.longitude),
    60 * 1000 // 1 minute
  );

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm:ss'));
      setCurrentDate(format(now, 'EEEE, dd MMMM yyyy', { locale: id }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleRetry = () => {
    prayerTimesResult.refetch();
    currentPrayerResult.refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header currentTime={currentTime} currentDate={currentDate} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* API Status */}
        <ApiStatus showDetails={false} className="mb-4" />

        {/* Location Selector */}
        <LocationSelector
          currentLocation={location}
          onLocationChange={handleLocationChange}
        />

        {/* Current Prayer Info */}
        {currentPrayerResult.data && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Info Shalat Saat Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Shalat Saat Ini</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentPrayerResult.data.current_prayer || 'Tidak ada'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Shalat Berikutnya</div>
                <div className="text-2xl font-bold text-orange-600">
                  {currentPrayerResult.data.next_prayer}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Waktu Tersisa</div>
                <div className="text-lg font-semibold text-blue-600">
                  {currentPrayerResult.data.time_until_next}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {prayerTimesResult.error && (
          <ErrorMessage message={prayerTimesResult.error} onRetry={handleRetry} />
        )}

        {currentPrayerResult.error && !prayerTimesResult.error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800">
              <strong>Peringatan:</strong> Gagal memuat info shalat real-time: {currentPrayerResult.error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {prayerTimesResult.loading && <LoadingSpinner />}

        {/* Prayer Times Grid */}
        {prayerTimesResult.data && !prayerTimesResult.loading && (
          <PrayerTimesGrid 
            prayerTimes={prayerTimesResult.data}
            currentPrayerInfo={currentPrayerResult.data}
          />
        )}

        {/* No Data State */}
        {!prayerTimesResult.data && !prayerTimesResult.loading && !prayerTimesResult.error && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
              <div className="text-6xl mb-4">🕌</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Pilih Lokasi untuk Melihat Jadwal Shalat
              </h3>
              <p className="text-gray-600">
                Gunakan tombol di atas untuk memilih lokasi Anda
              </p>
            </div>
          </div>
        )}

        {/* Footer with API Status Details */}
        <div className="mt-12">
          <ApiStatus showDetails={true} />
        </div>
      </main>
    </div>
  );
}

export default App;