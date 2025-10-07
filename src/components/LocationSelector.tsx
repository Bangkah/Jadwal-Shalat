import React, { useState } from 'react';
import { MapPin, Navigation, Search, Loader as Loader2, Globe } from 'lucide-react';
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
            timeout: 15000,
            maximumAge: 300000,
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
            errorMessage = 'Akses lokasi ditolak. Silakan aktifkan izin lokasi di browser.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia. Periksa GPS dan koneksi internet.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Timeout mendapatkan lokasi. Coba lagi atau pilih kota manual.';
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
      city: `${city.name}, ${city.province}`,
    };
    
    onLocationChange(location);
    setShowCityList(false);
    setSearchTerm('');
  };

  const filteredCities = cities?.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.province.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const citiesByProvince = filteredCities.reduce((acc, city) => {
    if (!acc[city.province]) {
      acc[city.province] = [];
    }
    acc[city.province].push(city);
    return acc;
  }, {} as Record<string, City[]>);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold text-gray-800">Pilih Lokasi</h2>
        <div className="ml-auto text-sm text-gray-500">
          {cities?.length || 0} kota tersedia
        </div>
      </div>

      {/* Current Location Display */}
      <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
        <div className="flex items-center space-x-2 text-emerald-800 mb-2">
          <Globe className="w-4 h-4" />
          <span className="font-medium">
            {currentLocation.city || 'Lokasi Kustom'}
          </span>
        </div>
        <div className="text-sm text-emerald-600">
          📍 {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
        </div>
        <div className="text-xs text-emerald-500 mt-1">
          Timezone: {currentLocation.longitude < 105 ? 'WIB (UTC+7)' : 
                    currentLocation.longitude < 120 ? 'WITA (UTC+8)' : 'WIT (UTC+9)'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
          disabled={citiesLoading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Search className="w-4 h-4" />
          <span>{citiesLoading ? 'Memuat...' : 'Pilih Kota'}</span>
        </button>
      </div>

      {/* City Search and List */}
      {showCityList && (
        <div className="border-t pt-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kota atau provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {citiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Memuat kota...</span>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3">
              {Object.keys(citiesByProvince).length > 0 ? (
                Object.entries(citiesByProvince).map(([province, provinceCities]) => (
                  <div key={province} className="space-y-1">
                    <div className="text-sm font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">
                      {province} ({provinceCities.length} kota)
                    </div>
                    {provinceCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors border-l-2 border-transparent hover:border-emerald-400"
                      >
                        <div className="font-medium text-gray-800">{city.name}</div>
                        <div className="text-sm text-gray-500">
                          📍 {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? (
                    <div>
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada kota yang ditemukan untuk "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div>
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada kota tersedia</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <div>
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}