import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface HeaderProps {
  currentTime: string;
  currentDate: string;
}

export function Header({ currentTime, currentDate }: HeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-islamic-800">Jadwal Shalat</h1>
              <p className="text-islamic-600">Waktu Shalat Hari Ini</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 text-islamic-700">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{currentTime}</span>
            </div>
            <p className="text-sm text-islamic-600">{currentDate}</p>
          </div>
        </div>
      </div>
    </header>
  );
}