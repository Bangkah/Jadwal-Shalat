import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import type { City } from '../types';

interface CitySelectorProps {
  cities: City[];
  selectedCity: string | null;
  onCityChange: (cityId: string) => void;
  loading: boolean;
}

export function CitySelector({ cities, selectedCity, onCityChange, loading }: CitySelectorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <MapPin className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-islamic-800">Pilih Kota</h2>
      </div>
      
      <div className="relative">
        <select
          value={selectedCity || ''}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-islamic-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-islamic-800 disabled:opacity-50"
        >
          <option value="">Pilih kota...</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.country}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-islamic-400 pointer-events-none" />
      </div>
    </div>
  );
}