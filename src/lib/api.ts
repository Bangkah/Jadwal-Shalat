import type { PrayerTimes, CurrentPrayerInfo, City, HealthStatus } from '../types/prayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
          'Accept': 'application/json',
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

  async getCitiesGrouped(): Promise<Record<string, City[]>> {
    return this.request<Record<string, City[]>>('/api/cities/grouped');
  }

  async getProvinces(): Promise<string[]> {
    return this.request<string[]>('/api/cities/provinces');
  }

  async checkHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }
}

export const apiClient = new ApiClient();

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