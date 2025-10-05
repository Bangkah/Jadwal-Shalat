import React from 'react';
import { useHealthCheck } from '../hooks/useApi';
import { Wifi, WifiOff, Database, Server, Clock } from 'lucide-react';

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
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Server className="w-5 h-5" />
          <span>Status API</span>
        </h3>
        <button
          onClick={refetch}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          disabled={loading}
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className="text-sm font-medium">Koneksi API</span>
          </div>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {health && (
          <>
            <div className="flex items-center justify-between">
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

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Versi API</span>
              <span className="text-sm font-mono text-gray-800">{health.version}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Waktu Server</span>
              <span className="text-sm text-gray-800">
                {new Date(health.time).toLocaleString('id-ID')}
              </span>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700 font-medium">Error:</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}