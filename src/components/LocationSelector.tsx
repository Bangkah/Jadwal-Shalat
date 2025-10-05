import React, { useState } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { useCities } from '../hooks/useApi';
import type { Location, City } from '../types/prayer';

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  currentLocation: Location;
  className?: string;
}

export function LocationSelector({
  onLocationChange,
  currentLocation,
  className = '',
}: LocationSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityList, setShowCityList] = useState(false);
  
  const { data: cities, loading: citiesLoading } = useCities();

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation tidak didukung browser ini'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: 'Lokasi Saya',
      };

      onLocationChange(location);
    } catch (err) {
      let errorMessage = 'Gagal mendapatkan lokasi';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan aktifkan izin lokasi.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia. Periksa GPS Anda.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Timeout mendapatkan lokasi. Coba lagi.';
            break;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City) => {
    const location: Location = {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
    };
    
    onLocationChange(location);
    setShowCityList(false);
    setSearchTerm('');
  };

  const handleManualInput = () => {
    const lat = prompt('Masukkan Latitude:', currentLocation.latitude.toString());
    const lon = prompt('Masukkan Longitude:', currentLocation.longitude.toString());
    const city = prompt('Masukkan Nama Kota (opsional):', currentLocation.city || '');

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        setError('Koordinat tidak valid');
        return;
      }
      
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        setError('Koordinat di luar jangkauan');
        return;
      }

      onLocationChange({
        latitude,
        longitude,
        city: city || 'Lokasi Kustom',
      });
    }
  };

  const filteredCities = cities?.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Pilih Lokasi</h2>
      </div>

      {/* Current Location Display */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">
            {currentLocation.city || 'Lokasi Kustom'}
          </span>
        </div>
        <div className="text-sm text-blue-600 mt-1">
          {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{loading ? 'Mencari...' : 'Lokasi Saya'}</span>
        </button>

        <button
          onClick={() => setShowCityList(!showCityList)}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Pilih Kota</span>
        </button>

        <button
          onClick={handleManualInput}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>Input Manual</span>
        </button>
      </div>

      {/* City Search and List */}
      {showCityList && (
        <div className="border-t pt-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {citiesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Memuat kota...</span>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={`${city.name}-${city.latitude}-${city.longitude}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{city.name}</div>
                    <div className="text-sm text-gray-500">
                      {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {searchTerm ? 'Kota tidak ditemukan' : 'Tidak ada kota tersedia'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}