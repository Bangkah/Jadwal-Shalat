<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\PrayerTime;
use App\Services\PrayerTimeService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PrayerTimeController extends Controller
{
    protected PrayerTimeService $prayerTimeService;

    public function __construct(PrayerTimeService $prayerTimeService)
    {
        $this->prayerTimeService = $prayerTimeService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'city' => 'nullable|string|max:100',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'date' => 'nullable|date|date_format:Y-m-d'
            ]);

            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $city = $request->city;
            $date = $request->date ?? Carbon::today()->format('Y-m-d');

            // Get coordinates from city if provided
            if ($city && (!$latitude || !$longitude)) {
                $cityModel = City::active()
                    ->where('name', 'LIKE', "%{$city}%")
                    ->first();

                if (!$cityModel) {
                    return response()->json([
                        'error' => 'City not found'
                    ], 404);
                }

                $latitude = $cityModel->latitude;
                $longitude = $cityModel->longitude;
                $city = $cityModel->name;
            }

            // Use default if none provided
            if (!$latitude || !$longitude) {
                $latitude = config('prayer.default_latitude', 5.5483);
                $longitude = config('prayer.default_longitude', 95.3238);
                $city = config('prayer.default_city', 'Banda Aceh');
            }

            $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$date}";

            $prayerTimes = Cache::remember($cacheKey, config('prayer.cache_ttl', 3600), function () use ($latitude, $longitude, $date, $city) {
                return $this->prayerTimeService->calculatePrayerTimes($latitude, $longitude, $date, $city);
            });

            return response()->json($prayerTimes);

        } catch (\Exception $e) {
            Log::error('Error getting prayer times: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to get prayer times',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function current(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180'
            ]);

            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $date = Carbon::today()->format('Y-m-d');

            $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$date}";
            $prayerTimes = Cache::remember($cacheKey, config('prayer.cache_ttl', 3600), function () use ($latitude, $longitude, $date) {
                return $this->prayerTimeService->calculatePrayerTimes($latitude, $longitude, $date);
            });

            // Create temporary model for helper methods
            $prayerTimeModel = new PrayerTime([
                'date' => $date,
                'fajr' => $prayerTimes['fajr'],
                'sunrise' => $prayerTimes['sunrise'],
                'dhuhr' => $prayerTimes['dhuhr'],
                'asr' => $prayerTimes['asr'],
                'maghrib' => $prayerTimes['maghrib'],
                'isha' => $prayerTimes['isha'],
                'latitude' => $latitude,
                'longitude' => $longitude
            ]);

            $currentPrayer = $prayerTimeModel->getCurrentPrayer();
            $nextPrayer = $prayerTimeModel->getNextPrayer();

            // Calculate time until next prayer
            $now = Carbon::now();
            $nextPrayerTime = Carbon::createFromFormat('H:i', $prayerTimes[$nextPrayer]);
            if ($nextPrayerTime->lt($now)) {
                $nextPrayerTime->addDay();
            }
            $diff = $now->diff($nextPrayerTime);
            $timeUntilNext = $diff->h > 0 ? "{$diff->h} jam {$diff->i} menit" : "{$diff->i} menit";

            return response()->json([
                'current_prayer' => $currentPrayer ? ucfirst($currentPrayer) : null,
                'next_prayer' => ucfirst($nextPrayer),
                'time_until_next' => $timeUntilNext,
                'prayer_times' => $prayerTimes
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting current prayer: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to get current prayer information',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}