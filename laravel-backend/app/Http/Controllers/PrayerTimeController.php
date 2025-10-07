<?php

namespace App\Http\Controllers;

use App\Http\Requests\PrayerTimeRequest;
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

    /**
     * Get prayer times for a city or coordinates
     */
    public function index(PrayerTimeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            $latitude = $validated['latitude'] ?? null;
            $longitude = $validated['longitude'] ?? null;
            $city = $validated['city'] ?? null;
            $date = $validated['date'] ?? Carbon::today()->format('Y-m-d');

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

            // Use default coordinates if none provided
            if (!$latitude || !$longitude) {
                $latitude = config('prayer.default_latitude', 5.5483);
                $longitude = config('prayer.default_longitude', 95.3238);
                $city = config('prayer.default_city', 'Banda Aceh');
            }

            // Generate cache key
            $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$date}";

            // Try to get from cache
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

    /**
     * Get current prayer information
     */
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

            // Get prayer times for today
            $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$date}";
            $prayerTimes = Cache::remember($cacheKey, config('prayer.cache_ttl', 3600), function () use ($latitude, $longitude, $date) {
                return $this->prayerTimeService->calculatePrayerTimes($latitude, $longitude, $date);
            });

            // Create temporary PrayerTime model for helper methods
            $prayerTimeModel = new PrayerTime([
                'date' => $date,
                'fajr' => Carbon::createFromFormat('H:i', $prayerTimes['fajr']),
                'sunrise' => Carbon::createFromFormat('H:i', $prayerTimes['sunrise']),
                'dhuhr' => Carbon::createFromFormat('H:i', $prayerTimes['dhuhr']),
                'asr' => Carbon::createFromFormat('H:i', $prayerTimes['asr']),
                'maghrib' => Carbon::createFromFormat('H:i', $prayerTimes['maghrib']),
                'isha' => Carbon::createFromFormat('H:i', $prayerTimes['isha']),
                'latitude' => $latitude,
                'longitude' => $longitude
            ]);

            $currentPrayer = $prayerTimeModel->getCurrentPrayer();
            $nextPrayer = $prayerTimeModel->getNextPrayer();
            $timeUntilNext = $prayerTimeModel->getTimeUntilNextPrayer();

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

    /**
     * Get prayer times for multiple days
     */
    public function monthly(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'month' => 'nullable|integer|between:1,12',
                'year' => 'nullable|integer|min:2020|max:2030'
            ]);

            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $month = $request->month ?? Carbon::now()->month;
            $year = $request->year ?? Carbon::now()->year;

            $startDate = Carbon::create($year, $month, 1);
            $endDate = $startDate->copy()->endOfMonth();

            $monthlyPrayerTimes = [];

            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                $dateStr = $date->format('Y-m-d');
                $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$dateStr}";

                $prayerTimes = Cache::remember($cacheKey, config('prayer.cache_ttl', 3600), function () use ($latitude, $longitude, $dateStr) {
                    return $this->prayerTimeService->calculatePrayerTimes($latitude, $longitude, $dateStr);
                });

                $monthlyPrayerTimes[] = $prayerTimes;
            }

            return response()->json([
                'month' => $month,
                'year' => $year,
                'prayer_times' => $monthlyPrayerTimes
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting monthly prayer times: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to get monthly prayer times',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}