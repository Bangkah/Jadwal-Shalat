import { useState, useEffect, useRef } from 'react';

// Types
interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  currentLocation: Location;
}

export default function LocationSelector({
  onLocationChange,
  currentLocation,
}: LocationSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto search saat user mengetik
  useEffect(() => {
    if (cityInput.trim().length >= 2) {
      // Debounce untuk menghindari terlalu banyak request
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/cities?keyword=${encodeURIComponent(cityInput)}`);
          const data = await res.json();
          if (data.cities && Array.isArray(data.cities)) {
            setSuggestedCities(data.cities);
          }
        } catch (err) {
          console.error('Failed to fetch cities:', err);
        } finally {
          setIsSearching(false);
        }
      }, 300); // Delay 300ms setelah user berhenti mengetik
    } else {
      setSuggestedCities([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [cityInput]);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');
    try {
      // Gunakan geolocation API browser
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Fetch prayer times dengan koordinat
            try {
              const res = await fetch(
                `/api/prayer-times?latitude=${latitude}&longitude=${longitude}`
              );
              if (!res.ok) throw new Error('Gagal fetch waktu sholat');
              
              const data = await res.json();
              onLocationChange({
                latitude: data.latitude || latitude,
                longitude: data.longitude || longitude,
                city: data.city || 'Lokasi Otomatis',
              });
            } catch (err) {
              // Jika gagal, gunakan koordinat saja
              onLocationChange({
                latitude,
                longitude,
                city: 'Lokasi Otomatis',
              });
            }
            setLoading(false);
          },
          (error) => {
            setError('Gagal mendapatkan lokasi. Pastikan GPS diaktifkan.');
            setLoading(false);
          }
        );
      } else {
        setError('Browser tidak mendukung geolocation.');
        setLoading(false);
      }
    } catch (err) {
      setError('Gagal mendapatkan lokasi otomatis.');
      setLoading(false);
    }
  };

  const handleSelectCity = async (city: string) => {
    setLoading(true);
    setError('');
    setCityInput('');
    setSuggestedCities([]);
    setShowManualInput(false);

    try {
      const res = await fetch(`/api/prayer-times?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      
      if (data.error) {
        setError('Kota tidak ditemukan.');
      } else if (data.latitude && data.longitude) {
        onLocationChange({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || city,
        });
      } else {
        setError('Gagal memuat data kota.');
      }
    } catch (err) {
      setError('Gagal memuat data kota.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManualInput = () => {
    setShowManualInput(true);
    setError('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCloseManualInput = () => {
    setShowManualInput(false);
    setCityInput('');
    setSuggestedCities([]);
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.locationInfo}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={styles.icon}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={styles.locationText}>
          {currentLocation.city || 'Lokasi Kustom'} ({currentLocation.latitude.toFixed(4)},{' '}
          {currentLocation.longitude.toFixed(4)})
        </span>
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          style={{...styles.button, ...styles.primaryButton}}
        >
          {loading ? '⏳ Mencari...' : '📍 Gunakan Lokasi Saya'}
        </button>
        <button
          onClick={handleOpenManualInput}
          style={{...styles.button, ...styles.secondaryButton}}
        >
          🔍 Cari Kota
        </button>
      </div>

      {/* Manual Input Modal */}
      {showManualInput && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Cari Kota</h3>
              <button onClick={handleCloseManualInput} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.searchContainer}>
              <input
                ref={inputRef}
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ketik nama kota (min. 2 huruf)..."
                style={styles.input}
              />
              {isSearching && <span style={styles.searchingText}>🔄 Mencari...</span>}
            </div>

            {suggestedCities.length > 0 && (
              <div style={styles.citiesList}>
                <p style={styles.citiesLabel}>Pilih kota:</p>
                {suggestedCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    style={styles.cityButton}
                    disabled={loading}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            )}

            {cityInput.trim().length >= 2 && suggestedCities.length === 0 && !isSearching && (
              <div style={styles.noResults}>
                <p>❌ Tidak ada kota yang ditemukan dengan kata kunci "{cityInput}"</p>
              </div>
            )}

            {cityInput.trim().length < 2 && (
              <div style={styles.hint}>
                <p>💡 Ketik minimal 2 huruf untuk mencari kota</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  icon: {
    color: '#4f46e5',
    flexShrink: 0,
  },
  locationText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.4',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  button: {
    flex: 1,
    minWidth: '140px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#4f46e5',
    border: '2px solid #4f46e5',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  searchContainer: {
    position: 'relative' as const,
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box' as const,
  },
  searchingText: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    color: '#6b7280',
  },
  citiesList: {
    marginTop: '16px',
  },
  citiesLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '12px',
  },
  cityButton: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#1f2937',
  },
  noResults: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '14px',
  },
  hint: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '14px',
  },
  error: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
  },
};