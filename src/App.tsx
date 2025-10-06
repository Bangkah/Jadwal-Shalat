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
    city: 'Lhokseumawe, Aceh',
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <span>🕌</span>
              <span>Info Shalat Real-time</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-1 font-medium">Shalat Saat Ini</div>
                <div className="text-2xl font-bold text-green-700">
                  {currentPrayerResult.data.current_prayer || 'Tidak ada'}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  {currentPrayerResult.data.current_prayer ? '🟢 Sedang berlangsung' : '⏸️ Di antara waktu shalat'}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-600 mb-1 font-medium">Shalat Berikutnya</div>
                <div className="text-2xl font-bold text-orange-700">
                  {currentPrayerResult.data.next_prayer}
                </div>
                <div className="text-xs text-orange-500 mt-1">
                  🔔 Siapkan diri untuk shalat
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 mb-1 font-medium">Waktu Tersisa</div>
                <div className="text-lg font-semibold text-blue-700">
                  {currentPrayerResult.data.time_until_next}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  ⏰ Countdown otomatis
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {prayerTimesResult.error && (
          <ErrorMessage 
            message={prayerTimesResult.error} 
            onRetry={handleRetry}
            type={prayerTimesResult.error.includes('timeout') || prayerTimesResult.error.includes('Network') ? 'network' : 'error'}
          />
        )}

        {currentPrayerResult.error && !prayerTimesResult.error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-500 mt-0.5">⚠️</div>
              <div>
                <p className="text-yellow-800 font-medium">
                  Peringatan: Info real-time tidak tersedia
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  {currentPrayerResult.error}
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Jadwal shalat tetap dapat dilihat di bawah ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {prayerTimesResult.loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
            <LoadingSpinner />
            <p className="text-center text-gray-600 mt-4">
              Memuat jadwal shalat untuk {location.city}...
            </p>
          </div>
        )}

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
                Selamat Datang di Aplikasi Jadwal Shalat
              </h3>
              <p className="text-gray-600 mb-4">
                Pilih lokasi Anda untuk melihat jadwal shalat yang akurat
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>✅ 50+ kota di Indonesia</p>
                <p>✅ Perhitungan metode Kemenag</p>
                <p>✅ Update real-time</p>
                <p>✅ Timezone otomatis WIB/WITA/WIT</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer with API Status Details */}
        <div className="mt-12">
          <ApiStatus showDetails={true} />
        </div>

        {/* App Info */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">🕌 Aplikasi Jadwal Shalat Indonesia v2.1.0</p>
            <p>Dibuat dengan ❤️ untuk umat Muslim Indonesia</p>
            <p className="text-xs">
              Menggunakan perhitungan waktu shalat metode Kementerian Agama RI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;