<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PrayerTimeService
{
    public function calculatePrayerTimes(float $latitude, float $longitude, string $date, ?string $cityName = null): array
    {
        try {
            $carbonDate = Carbon::parse($date);
            $dayOfYear = $carbonDate->dayOfYear;

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
                'date' => $date,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'city' => $cityName,
                'timezone' => $this->getIndonesianTimezone($longitude),
                'fajr' => $this->formatTime($fajr),
                'sunrise' => $this->formatTime($sunrise),
                'dhuhr' => $this->formatTime($dhuhr),
                'asr' => $this->formatTime($asr),
                'maghrib' => $this->formatTime($maghrib),
                'isha' => $this->formatTime($isha)
            ];

        } catch (\Exception $e) {
            Log::error('Error calculating prayer times: ' . $e->getMessage());
            
            return $this->getFallbackPrayerTimes($latitude, $longitude, $date, $cityName);
        }
    }

    private function calculateEquationOfTime(int $dayOfYear): float
    {
        $b = 2 * pi() * ($dayOfYear - 81) / 365;
        return 9.87 * sin(2 * $b) - 7.53 * cos($b) - 1.5 * sin($b);
    }

    private function calculateSolarDeclination(int $dayOfYear): float
    {
        return 23.45 * sin(deg2rad(360 * ($dayOfYear - 81) / 365));
    }

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

        $time = $time - ($longitude / 15) + ($equationOfTime / 60);
        $timezone = $this->getTimezoneOffset($longitude);
        
        return $time + $timezone;
    }

    private function calculateDhuhr(float $longitude, float $equationOfTime): float
    {
        $time = 12 - ($longitude / 15) + ($equationOfTime / 60);
        $timezone = $this->getTimezoneOffset($longitude);
        return $time + $timezone;
    }

    private function calculateAsr(float $latitude, float $longitude, float $declination, float $equationOfTime): float
    {
        $latRad = deg2rad($latitude);
        $decRad = deg2rad($declination);

        $shadowRatio = 1 + tan(abs($latRad - $decRad));
        $angle = rad2deg(atan(1 / $shadowRatio));

        $hourAngle = acos((sin(deg2rad($angle)) - sin($latRad) * sin($decRad)) / (cos($latRad) * cos($decRad)));
        $hourAngle = rad2deg($hourAngle) / 15;

        $time = 12 + $hourAngle - ($longitude / 15) + ($equationOfTime / 60);
        $timezone = $this->getTimezoneOffset($longitude);
        
        return $time + $timezone;
    }

    private function getTimezoneOffset(float $longitude): float
    {
        if ($longitude < 105) {
            return 7; // WIB
        } elseif ($longitude < 120) {
            return 8; // WITA
        } else {
            return 9; // WIT
        }
    }

    private function getIndonesianTimezone(float $longitude): string
    {
        if ($longitude < 105) {
            return 'Asia/Jakarta';
        } elseif ($longitude < 120) {
            return 'Asia/Makassar';
        } else {
            return 'Asia/Jayapura';
        }
    }

    private function formatTime(float $time): string
    {
        while ($time < 0) $time += 24;
        while ($time >= 24) $time -= 24;

        $hours = floor($time);
        $minutes = round(($time - $hours) * 60);

        if ($minutes >= 60) {
            $hours += 1;
            $minutes -= 60;
        }

        return sprintf('%02d:%02d', $hours, $minutes);
    }

    private function getFallbackPrayerTimes(float $latitude, float $longitude, string $date, ?string $cityName = null): array
    {
        return [
            'date' => $date,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'city' => $cityName,
            'timezone' => $this->getIndonesianTimezone($longitude),
            'fajr' => '04:45',
            'sunrise' => '06:00',
            'dhuhr' => '12:00',
            'asr' => '15:15',
            'maghrib' => '18:00',
            'isha' => '19:15'
        ];
    }
}