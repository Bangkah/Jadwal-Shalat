import React from 'react';
import { useHealthCheck } from '../hooks/useApi';
import { Wifi, WifiOff, Database, Server, Clock, MapPin } from 'lucide-react';

interface ApiStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function ApiStatus({ className = '', showDetails = false }: ApiStatusProps) {
  const { data: health, loading, error, refetch } = useHealthCheck();

  const getStatusColor = () => {
    if (loading) return 'text-yellow-500';
    if (error || !health) return 'text-red-500';
    if (health.status === 'healthy') return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (loading) return <Clock className="w-4 h-4 animate-spin" />;
    if (error || !health) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (loading) return 'Memeriksa...';
    if (error) return 'Offline';
    if (!health) return 'Tidak terhubung';
    return health.status === 'healthy' ? 'Online' : 'Bermasalah';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Server className="w-5 h-5" />
          <span>Status Sistem</span>
        </h3>
        <button
          onClick={refetch}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Memuat...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <span className="text-sm font-medium">API Server</span>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {health && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Database className={`w-4 h-4 ${
                    health.database === 'connected' ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className={`text-sm font-semibold ${
                  health.database === 'connected' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {health.database === 'connected' ? 'Terhubung' : 'Terputus'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Kota Tersedia</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {health.cities_count || 0} kota
                </span>
              </div>
            </>
          )}
        </div>

        {/* System Info */}
        <div className="space-y-3">
          {health && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Versi API</div>
                <div className="text-sm font-mono text-gray-800">{health.version}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Waktu Server</div>
                <div className="text-sm text-gray-800">
                  {new Date(health.time).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    dateStyle: 'medium',
                    timeStyle: 'medium'
                  })}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">Uptime</div>
                <div className="text-sm text-green-600 font-medium">
                  ✅ Sistem berjalan normal
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <div>
              <p className="text-sm text-red-700 font-medium">Error Koneksi:</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <div className="mt-2 text-xs text-red-500">
                <p>• Pastikan backend server berjalan di port 8080</p>
                <p>• Periksa koneksi internet Anda</p>
                <p>• Coba refresh halaman</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Info */}
      {health && !error && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-green-500">✅</div>
            <div>
              <p className="text-sm text-green-700 font-medium">
                Sistem berjalan dengan baik!
              </p>
              <p className="text-xs text-green-600 mt-1">
                API server terhubung dan siap melayani permintaan jadwal shalat
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}