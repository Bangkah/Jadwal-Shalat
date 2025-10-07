<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\PrayerTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HealthController extends Controller
{
    /**
     * Health check endpoint
     */
    public function check(): JsonResponse
    {
        try {
            $health = [
                'status' => 'healthy',
                'time' => Carbon::now()->toISOString(),
                'version' => config('app.version', '2.1.0'),
                'environment' => config('app.env'),
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'cities_count' => $this->getCitiesCount(),
                'prayer_times_count' => $this->getPrayerTimesCount(),
                'uptime' => $this->getUptime(),
                'memory_usage' => $this->getMemoryUsage(),
                'disk_usage' => $this->getDiskUsage()
            ];

            $httpStatus = $health['database']['status'] === 'connected' ? 200 : 503;

            return response()->json($health, $httpStatus);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'time' => Carbon::now()->toISOString(),
                'error' => $e->getMessage()
            ], 503);
        }
    }

    /**
     * Detailed system information
     */
    public function info(): JsonResponse
    {
        try {
            $info = [
                'application' => [
                    'name' => config('app.name'),
                    'version' => config('app.version', '2.1.0'),
                    'environment' => config('app.env'),
                    'debug' => config('app.debug'),
                    'url' => config('app.url'),
                    'timezone' => config('app.timezone')
                ],
                'system' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'server_time' => Carbon::now()->toISOString(),
                    'uptime' => $this->getUptime(),
                    'memory_usage' => $this->getMemoryUsage(),
                    'disk_usage' => $this->getDiskUsage()
                ],
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'statistics' => [
                    'cities_count' => $this->getCitiesCount(),
                    'prayer_times_count' => $this->getPrayerTimesCount(),
                    'active_cities' => City::active()->count(),
                    'provinces_count' => City::active()->distinct('province')->count('province')
                ]
            ];

            return response()->json($info);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get system information',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check database connection
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $connectionName = DB::connection()->getName();
            
            return [
                'status' => 'connected',
                'connection' => $connectionName,
                'driver' => DB::connection()->getDriverName()
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'disconnected',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Check cache connection
     */
    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'test', 60);
            $value = Cache::get($key);
            Cache::forget($key);

            return [
                'status' => $value === 'test' ? 'working' : 'failed',
                'driver' => config('cache.default')
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get cities count
     */
    private function getCitiesCount(): int
    {
        try {
            return Cache::remember('health_cities_count', 300, function () {
                return City::count();
            });
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get prayer times count
     */
    private function getPrayerTimesCount(): int
    {
        try {
            return Cache::remember('health_prayer_times_count', 300, function () {
                return PrayerTime::count();
            });
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get application uptime
     */
    private function getUptime(): string
    {
        try {
            $uptimeFile = storage_path('framework/uptime');
            
            if (!file_exists($uptimeFile)) {
                file_put_contents($uptimeFile, time());
            }
            
            $startTime = (int) file_get_contents($uptimeFile);
            $uptime = time() - $startTime;
            
            $days = floor($uptime / 86400);
            $hours = floor(($uptime % 86400) / 3600);
            $minutes = floor(($uptime % 3600) / 60);
            
            return "{$days}d {$hours}h {$minutes}m";
        } catch (\Exception $e) {
            return 'unknown';
        }
    }

    /**
     * Get memory usage
     */
    private function getMemoryUsage(): array
    {
        return [
            'current' => $this->formatBytes(memory_get_usage(true)),
            'peak' => $this->formatBytes(memory_get_peak_usage(true)),
            'limit' => ini_get('memory_limit')
        ];
    }

    /**
     * Get disk usage
     */
    private function getDiskUsage(): array
    {
        try {
            $path = storage_path();
            $total = disk_total_space($path);
            $free = disk_free_space($path);
            $used = $total - $free;
            
            return [
                'total' => $this->formatBytes($total),
                'used' => $this->formatBytes($used),
                'free' => $this->formatBytes($free),
                'percentage' => round(($used / $total) * 100, 2)
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}