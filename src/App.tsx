import { useState, useEffect } from 'react';
import { PrayerTimeCard } from './components/PrayerTimeCard';
import { LocationSelector } from './components/LocationSelector';
import { getPrayerTimes, getCurrentPrayer, checkAPIHealth } from './lib/api';
import { getDefaultLocation } from './lib/location';
import type { PrayerTimes, CurrentPrayerInfo, Location } from './types/prayer';
import './App.css';

function App() {
  const [location, setLocation] = useState<Location>(getDefaultLocation());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentPrayerInfo, setCurrentPrayerInfo] = useState<CurrentPrayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    checkAPI();
  }, []);

  useEffect(() => {
    if (apiStatus === 'online') {
      fetchPrayerTimes();
      fetchCurrentPrayer();

      const interval = setInterval(() => {
        fetchCurrentPrayer();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [location, apiStatus]);

  const checkAPI = async () => {
    setApiStatus('checking');
    const isHealthy = await checkAPIHealth();
    setApiStatus(isHealthy ? 'online' : 'offline');
  };

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError('');

    try {
      const times = await getPrayerTimes(
        location.latitude,
        location.longitude,
        undefined,
        location.city
      );
      setPrayerTimes(times);
    } catch (err) {
      setError('Gagal mengambil jadwal shalat. Pastikan backend API berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrayer = async () => {
    try {
      const info = await getCurrentPrayer(location.latitude, location.longitude);
      setCurrentPrayerInfo(info);
    } catch (err) {
      console.error('Failed to fetch current prayer:', err);
    }
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (apiStatus === 'checking') {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Memeriksa koneksi API...</p>
          </div>
        </div>
      </div>
    );
  }

  if (apiStatus === 'offline') {
    return (
      <div className="app">
        <div className="container">
          <div className="error-screen">
            <div className="error-icon">⚠️</div>
            <h2>API Backend Tidak Tersedia</h2>
            <p>Backend API belum berjalan. Silakan jalankan server Golang terlebih dahulu.</p>
            <div className="instructions">
              <h3>Cara menjalankan backend:</h3>
              <ol>
                <li>Buka folder backend</li>
                <li>
                  Atur environment variable <code>DATABASE_URL</code>
                </li>
                <li>
                  Jalankan: <code>go run main.go</code>
                </li>
              </ol>
            </div>
            <button onClick={checkAPI} className="btn-retry">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Jadwal Shalat</h1>
          <div className="date-time">
            <div className="date">{formatDate(currentTime)}</div>
            <div className="time">{formatTime(currentTime)}</div>
          </div>
        </header>

        <LocationSelector onLocationChange={handleLocationChange} currentLocation={location} />

        {currentPrayerInfo && (
          <div className="current-prayer-info">
            <div className="info-card">
              <div className="info-label">Waktu Shalat Sekarang</div>
              <div className="info-value">{currentPrayerInfo.current_prayer}</div>
            </div>
            <div className="info-card highlight">
              <div className="info-label">Shalat Berikutnya</div>
              <div className="info-value">{currentPrayerInfo.next_prayer}</div>
              <div className="info-countdown">{currentPrayerInfo.time_until_next}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Memuat jadwal shalat...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchPrayerTimes} className="btn-retry">
              Coba Lagi
            </button>
          </div>
        ) : prayerTimes ? (
          <div className="prayer-times-grid">
            <PrayerTimeCard
              name="Subuh"
              time={prayerTimes.fajr}
              isCurrent={currentPrayerInfo?.current_prayer === 'Fajr'}
              isNext={currentPrayerInfo?.next_prayer === 'Fajr'}
            />
            <PrayerTimeCard
              name="Terbit"
              time={prayerTimes.sunrise}
              isCurrent={currentPrayerInfo?.current_prayer === 'Sunrise'}
              isNext={currentPrayerInfo?.next_prayer === 'Sunrise'}
            />
            <PrayerTimeCard
              name="Dzuhur"
              time={prayerTimes.dhuhr}
              isCurrent={currentPrayerInfo?.current_prayer === 'Dhuhr'}
              isNext={currentPrayerInfo?.next_prayer === 'Dhuhr'}
            />
            <PrayerTimeCard
              name="Ashar"
              time={prayerTimes.asr}
              isCurrent={currentPrayerInfo?.current_prayer === 'Asr'}
              isNext={currentPrayerInfo?.next_prayer === 'Asr'}
            />
            <PrayerTimeCard
              name="Maghrib"
              time={prayerTimes.maghrib}
              isCurrent={currentPrayerInfo?.current_prayer === 'Maghrib'}
              isNext={currentPrayerInfo?.next_prayer === 'Maghrib'}
            />
            <PrayerTimeCard
              name="Isya"
              time={prayerTimes.isha}
              isCurrent={currentPrayerInfo?.current_prayer === 'Isha'}
              isNext={currentPrayerInfo?.next_prayer === 'Isha'}
            />
          </div>
        ) : null}

        <footer className="footer">
          <div className="api-info">
            <h3>API Documentation</h3>
            <div className="api-endpoints">
              <div className="endpoint">
                <code>GET /api/prayer-times</code>
                <p>Parameters: latitude, longitude, date (optional), city (optional)</p>
              </div>
              <div className="endpoint">
                <code>GET /api/prayer-times/current</code>
                <p>Parameters: latitude, longitude</p>
              </div>
              <div className="endpoint">
                <code>GET /api/health</code>
                <p>Check API health status</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
