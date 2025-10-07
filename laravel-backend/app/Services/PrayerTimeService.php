<?php

namespace App\Services;

use App\Models\City;
use App\Models\PrayerTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PrayerTimeService
{
    /**
     * Calculate prayer times for given coordinates and date
     */
    public function calculatePrayerTimes(float $latitude, float $longitude, string $date, ?string $cityName = null): array
    {
        try {
            // Check if we have cached prayer times in database
            $cachedPrayerTime = PrayerTime::forCoordinates($latitude, $longitude)
                ->forDate($date)
                ->first();

            if ($cachedPrayerTime) {
                return $this->formatPrayerTimesResponse($cachedPrayerTime, $cityName);
            }

            // Calculate new prayer times
            $prayerTimes = $this->calculateUsingAlgorithm($latitude, $longitude, $date);
            
            // Save to database for caching
            $this->savePrayerTimes($latitude, $longitude, $date, $prayerTimes, $cityName);

            return [
                'date' => $date,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'city' => $cityName,
                'timezone' => $this->getIndonesianTimezone($longitude),
                'fajr' => $prayerTimes['fajr'],
                'sunrise' => $prayerTimes['sunrise'],
                'dhuhr' => $prayerTimes['dhuhr'],
                'asr' => $prayerTimes['asr'],
                'maghrib' => $prayerTimes['maghrib'],
                'isha' => $prayerTimes['isha']
            ];

        } catch (\Exception $e) {
            Log::error('Error calculating prayer times: ' . $e->getMessage());
            
            // Return fallback prayer times
            return $this->getFallbackPrayerTimes($latitude, $longitude, $date, $cityName);
        }
    }

    /**
     * Calculate prayer times using Islamic algorithm
     */
    private function calculateUsingAlgorithm(float $latitude, float $longitude, string $date): array
    {
        $carbonDate = Carbon::parse($date);
        $dayOfYear = $carbonDate->dayOfYear;
        $year = $carbonDate->year;

        // Calculate equation of time and solar declination
        $equationOfTime = $this->calculateEquationOfTime($dayOfYear);
        $solarDeclination = $this->calculateSolarDeclination($dayOfYear);

        // Calculate prayer times
        $fajr = $this->calculatePrayerTime($latitude, $longitude, $solarDeclination, -18, $equationOfTime, true);
        $sunrise = $this->calculatePrayerTime($latitude, $longitude, $solarDeclination, -0.833, $equationOfTime, true);
        $dhuhr = $this->calculateDhuhr($longitude, $equationOfTime);
        $asr = $this->calculateAsr($latitude, $longitude, $solarDeclination, $equationOfTime);
        $maghrib = $this->calculatePrayerTime($latitude, $longitude, $solarDeclination, -0.833, $equationOfTime, false);
        $isha = $this->calculatePrayerTime($latitude, $longitude, $solarDeclination, -17, $equationOfTime, false);

        return [
            'fajr' => $this->formatTime($fajr),
            'sunrise' => $this->formatTime($sunrise),
            'dhuhr' => $this->formatTime($dhuhr),
            'asr' => $this->formatTime($asr),
            'maghrib' => $this->formatTime($maghrib),
            'isha' => $this->formatTime($isha)
        ];
    }

    /**
     * Calculate equation of time
     */
    private function calculateEquationOfTime(int $dayOfYear): float
    {
        $b = 2 * pi() * ($dayOfYear - 81) / 365;
        return 9.87 * sin(2 * $b) - 7.53 * cos($b) - 1.5 * sin($b);
    }

    /**
     * Calculate solar declination
     */
    private function calculateSolarDeclination(int $dayOfYear): float
    {
        return 23.45 * sin(deg2rad(360 * ($dayOfYear - 81) / 365));
    }

    /**
     * Calculate prayer time
     */
    private function calculatePrayerTime(float $latitude, float $longitude, float $declination, float $angle, float $equationOfTime, bool $isMorning): float
    {
        $latRad = deg2rad($latitude);
        $decRad = deg2rad($declination);
        $angleRad = deg2rad($angle);

        $hourAngle = acos((-sin($angleRad) - sin($latRad) * sin($decRad)) / (cos($latRad) * cos($decRad)));
        $hourAngle = rad2deg($hourAngle) / 15;

        if ($isMorning) {
            $time = 12 - $hourAngle;
        } else {
            $time = 12 + $hourAngle;
        }

        // Apply longitude and equation of time corrections
        $time = $time - ($longitude / 15) + ($equationOfTime / 60);

        // Apply timezone correction
        $timezone = $this->getTimezoneOffset($longitude);
        $time += $timezone;

        return $time;
    }

    /**
     * Calculate Dhuhr time
     */
    private function calculateDhuhr(float $longitude, float $equationOfTime): float
    {
        $time = 12 - ($longitude / 15) + ($equationOfTime / 60);
        $timezone = $this->getTimezoneOffset($longitude);
        return $time + $timezone;
    }

    /**
     * Calculate Asr time
     */
    private function calculateAsr(float $latitude, float $longitude, float $declination, float $equationOfTime): float
    {
        $latRad = deg2rad($latitude);
        $decRad = deg2rad($declination);

        // Hanafi method: shadow length = 2 * object length + shadow at Dhuhr
        $shadowRatio = 2 + tan(abs($latRad - $decRad));
        $angle = rad2deg(atan(1 / $shadowRatio));

        $hourAngle = acos((sin(deg2rad($angle)) - sin($latRad) * sin($decRad)) / (cos($latRad) * cos($decRad)));
        $hourAngle = rad2deg($hourAngle) / 15;

        $time = 12 + $hourAngle - ($longitude / 15) + ($equationOfTime / 60);
        $timezone = $this->getTimezoneOffset($longitude);
        
        return $time + $timezone;
    }

    /**
     * Get timezone offset for Indonesian coordinates
     */
    private function getTimezoneOffset(float $longitude): float
    {
        if ($longitude < 105) {
            return 7; // WIB (UTC+7)
        } elseif ($longitude < 120) {
            return 8; // WITA (UTC+8)
        } else {
            return 9; // WIT (UTC+9)
        }
    }

    /**
     * Get Indonesian timezone string
     */
    private function getIndonesianTimezone(float $longitude): string
    {
        if ($longitude < 105) {
            return 'Asia/Jakarta'; // WIB (UTC+7)
        } elseif ($longitude < 120) {
            return 'Asia/Makassar'; // WITA (UTC+8)
        } else {
            return 'Asia/Jayapura'; // WIT (UTC+9)
        }
    }

    /**
     * Format time from decimal hours to HH:MM
     */
    private function formatTime(float $time): string
    {
        // Ensure time is within 24-hour format
        while ($time < 0) $time += 24;
        while ($time >= 24) $time -= 24;

        $hours = floor($time);
        $minutes = round(($time - $hours) * 60);

        // Handle minute overflow
        if ($minutes >= 60) {
            $hours += 1;
            $minutes -= 60;
        }

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    /**
     * Save prayer times to database
     */
    private function savePrayerTimes(float $latitude, float $longitude, string $date, array $prayerTimes, ?string $cityName = null): void
    {
        try {
            // Find or create city
            $city = null;
            if ($cityName) {
                $city = City::where('name', $cityName)->first();
            }

            PrayerTime::updateOrCreate([
                'latitude' => $latitude,
                'longitude' => $longitude,
                'date' => $date
            ], [
                'city_id' => $city?->id,
                'fajr' => Carbon::createFromFormat('H:i', $prayerTimes['fajr']),
                'sunrise' => Carbon::createFromFormat('H:i', $prayerTimes['sunrise']),
                'dhuhr' => Carbon::createFromFormat('H:i', $prayerTimes['dhuhr']),
                'asr' => Carbon::createFromFormat('H:i', $prayerTimes['asr']),
                'maghrib' => Carbon::createFromFormat('H:i', $prayerTimes['maghrib']),
                'isha' => Carbon::createFromFormat('H:i', $prayerTimes['isha'])
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to save prayer times to database: ' . $e->getMessage());
        }
    }

    /**
     * Format prayer times response from database model
     */
    private function formatPrayerTimesResponse(PrayerTime $prayerTime, ?string $cityName = null): array
    {
        return [
            'date' => $prayerTime->date->format('Y-m-d'),
            'latitude' => $prayerTime->latitude,
            'longitude' => $prayerTime->longitude,
            'city' => $cityName ?? $prayerTime->city?->name,
            'timezone' => $this->getIndonesianTimezone($prayerTime->longitude),
            'fajr' => $prayerTime->fajr->format('H:i'),
            'sunrise' => $prayerTime->sunrise->format('H:i'),
            'dhuhr' => $prayerTime->dhuhr->format('H:i'),
            'asr' => $prayerTime->asr->format('H:i'),
            'maghrib' => $prayerTime->maghrib->format('H:i'),
            'isha' => $prayerTime->isha->format('H:i')
        ];
    }

    /**
     * Get fallback prayer times if calculation fails
     */
    private function getFallbackPrayerTimes(float $latitude, float $longitude, string $date, ?string $cityName = null): array
    {
        // Simple fallback based on latitude
        $latFactor = abs($latitude) / 90.0;
        $shiftMinutes = (int)($latFactor * 30);

        return [
            'date' => $date,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'city' => $cityName,
            'timezone' => $this->getIndonesianTimezone($longitude),
            'fajr' => sprintf('%02d:%02d', 4, 45 - $shiftMinutes),
            'sunrise' => '06:00',
            'dhuhr' => '12:00',
            'asr' => sprintf('%02d:%02d', 15, 15 + ($shiftMinutes / 2)),
            'maghrib' => '18:00',
            'isha' => sprintf('%02d:%02d', 19, 15 + $shiftMinutes)
        ];
    }
}