import { useState } from 'react';
import type { Location } from '../types/prayer';
import { getCurrentLocation } from '../lib/location';

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  currentLocation: Location;
}

export const LocationSelector = ({
  onLocationChange,
  currentLocation,
}: LocationSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      onLocationChange(location);
    } catch (err) {
      setError('Gagal mendapatkan lokasi. Pastikan GPS diaktifkan.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    const lat = prompt('Masukkan Latitude:', currentLocation.latitude.toString());
    const lon = prompt('Masukkan Longitude:', currentLocation.longitude.toString());
    const city = prompt('Masukkan Nama Kota (opsional):', currentLocation.city || '');

    if (lat && lon) {
      onLocationChange({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        city: city || undefined,
      });
    }
  };

  return (
    <div className="location-selector">
      <div className="location-info">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>
          {currentLocation.city || 'Lokasi Kustom'} ({currentLocation.latitude.toFixed(4)},{' '}
          {currentLocation.longitude.toFixed(4)})
        </span>
      </div>

      <div className="location-buttons">
        <button onClick={handleGetCurrentLocation} disabled={loading} className="btn-location">
          {loading ? 'Mencari...' : 'Gunakan Lokasi Saya'}
        </button>
        <button onClick={handleManualInput} className="btn-location secondary">
          Input Manual
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
