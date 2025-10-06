import type { PrayerTimes, CurrentPrayerInfo, City } from '../types/prayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_URL, timeout: number = 15000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server tidak merespons dalam 15 detik');
        }
        throw error;
      }
      
      throw new Error('Network error - periksa koneksi internet');
    }
  }

  async getPrayerTimes(params: {
    city?: string;
    latitude?: number;
    longitude?: number;
    date?: string;
  }): Promise<PrayerTimes> {
    const searchParams = new URLSearchParams();
    
    if (params.city) searchParams.append('city', params.city);
    if (params.latitude !== undefined) searchParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) searchParams.append('longitude', params.longitude.toString());
    if (params.date) searchParams.append('date', params.date);

    return this.request<PrayerTimes>(`/api/prayer-times?${searchParams}`);
  }

  async getCurrentPrayer(latitude: number, longitude: number): Promise<CurrentPrayerInfo> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    
    return this.request<CurrentPrayerInfo>(`/api/prayer-times/current?${params}`);
  }

  async getCities(): Promise<City[]> {
    return this.request<City[]>('/api/cities');
  }

  async checkHealth(): Promise<{
    status: string;
    time: string;
    database: string;
    version: string;
    cities_count: number;
  }> {
    return this.request('/api/health');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Legacy functions for backward compatibility
export async function getPrayerTimes(
  city?: string,
  date?: string
): Promise<PrayerTimes> {
  return apiClient.getPrayerTimes({ city, date });
}

export async function getCurrentPrayer(
  latitude: number,
  longitude: number
): Promise<CurrentPrayerInfo> {
  return apiClient.getCurrentPrayer(latitude, longitude);
}

export async function getCities(): Promise<City[]> {
  return apiClient.getCities();
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const health = await apiClient.checkHealth();
    return health.status === 'healthy';
  } catch {
    return false;
  }
}

// Utility functions
export function formatPrayerTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    
    if (isNaN(hour) || isNaN(min)) return time;
    
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  } catch {
    return time;
  }
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