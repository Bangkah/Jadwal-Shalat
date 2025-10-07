<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        try {
            $health = [
                'status' => 'healthy',
                'time' => Carbon::now()->toISOString(),
                'version' => config('app.version', '3.0.0'),
                'database' => $this->checkDatabase(),
                'cities_count' => $this->getCitiesCount(),
                'cache' => $this->checkCache(),
            ];

            $httpStatus = $health['database'] === 'connected' ? 200 : 503;

            return response()->json($health, $httpStatus);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'time' => Carbon::now()->toISOString(),
                'error' => $e->getMessage()
            ], 503);
        }
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'connected';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }

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

    private function checkCache(): string
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'test', 60);
            $value = Cache::get($key);
            Cache::forget($key);

            return $value === 'test' ? 'working' : 'failed';
        } catch (\Exception $e) {
            return 'failed';
        }
    }
}