import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'network';
}

export function ErrorMessage({ message, onRetry, type = 'error' }: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-8 h-8" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8" />;
      default:
        return <AlertCircle className="w-8 h-8" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'network':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const colors = getColors();

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Masalah Koneksi';
      case 'warning':
        return 'Peringatan';
      default:
        return 'Terjadi Kesalahan';
    }
  };

  const getSuggestions = () => {
    if (message.includes('timeout') || message.includes('Network')) {
      return [
        'Periksa koneksi internet Anda',
        'Pastikan server backend berjalan',
        'Coba refresh halaman'
      ];
    }
    
    if (message.includes('city not found')) {
      return [
        'Periksa ejaan nama kota',
        'Coba gunakan nama kota yang lebih umum',
        'Gunakan koordinat manual sebagai alternatif'
      ];
    }

    if (message.includes('database')) {
      return [
        'Server sedang mengalami masalah database',
        'Coba lagi dalam beberapa saat',
        'Hubungi administrator jika masalah berlanjut'
      ];
    }

    return [
      'Coba refresh halaman',
      'Periksa koneksi internet',
      'Hubungi administrator jika masalah berlanjut'
    ];
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start space-x-4">
        <div className={`${colors.icon} flex-shrink-0`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className={`${colors.title} text-lg font-semibold mb-2`}>
            {getTitle()}
          </h3>
          
          <p className={`${colors.text} mb-4`}>
            {message}
          </p>

          <div className={`${colors.text} text-sm mb-4`}>
            <p className="font-medium mb-2">Saran:</p>
            <ul className="list-disc list-inside space-y-1">
              {getSuggestions().map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className={`${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}