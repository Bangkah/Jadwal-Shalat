<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PrayerTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'date',
        'fajr',
        'sunrise',
        'dhuhr',
        'asr',
        'maghrib',
        'isha',
        'latitude',
        'longitude'
    ];

    protected $casts = [
        'date' => 'date',
        'fajr' => 'datetime:H:i',
        'sunrise' => 'datetime:H:i',
        'dhuhr' => 'datetime:H:i',
        'asr' => 'datetime:H:i',
        'maghrib' => 'datetime:H:i',
        'isha' => 'datetime:H:i',
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /**
     * Get the city that owns the prayer times
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get prayer times as array
     */
    public function getPrayerTimesArray(): array
    {
        return [
            'fajr' => $this->fajr->format('H:i'),
            'sunrise' => $this->sunrise->format('H:i'),
            'dhuhr' => $this->dhuhr->format('H:i'),
            'asr' => $this->asr->format('H:i'),
            'maghrib' => $this->maghrib->format('H:i'),
            'isha' => $this->isha->format('H:i'),
        ];
    }

    /**
     * Get current prayer name
     */
    public function getCurrentPrayer(): ?string
    {
        $now = Carbon::now()->format('H:i');
        $prayers = $this->getPrayerTimesArray();

        $currentPrayer = null;
        foreach ($prayers as $name => $time) {
            if ($now >= $time) {
                $currentPrayer = $name;
            } else {
                break;
            }
        }

        return $currentPrayer;
    }

    /**
     * Get next prayer name
     */
    public function getNextPrayer(): string
    {
        $now = Carbon::now()->format('H:i');
        $prayers = $this->getPrayerTimesArray();

        foreach ($prayers as $name => $time) {
            if ($now < $time) {
                return $name;
            }
        }

        // If past all prayers, next is Fajr tomorrow
        return 'fajr';
    }

    /**
     * Get time until next prayer
     */
    public function getTimeUntilNextPrayer(): string
    {
        $now = Carbon::now();
        $nextPrayer = $this->getNextPrayer();
        $prayers = $this->getPrayerTimesArray();

        $nextPrayerTime = Carbon::createFromFormat('H:i', $prayers[$nextPrayer]);
        
        // If next prayer is tomorrow
        if ($nextPrayerTime->lt($now)) {
            $nextPrayerTime->addDay();
        }

        $diff = $now->diff($nextPrayerTime);
        
        if ($diff->h > 0) {
            return "{$diff->h} jam {$diff->i} menit";
        } else {
            return "{$diff->i} menit";
        }
    }

    /**
     * Scope for today's prayer times
     */
    public function scopeToday($query)
    {
        return $query->where('date', Carbon::today());
    }

    /**
     * Scope for specific date
     */
    public function scopeForDate($query, string $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope for specific coordinates
     */
    public function scopeForCoordinates($query, float $latitude, float $longitude, float $tolerance = 0.01)
    {
        return $query->whereBetween('latitude', [$latitude - $tolerance, $latitude + $tolerance])
                    ->whereBetween('longitude', [$longitude - $tolerance, $longitude + $tolerance]);
    }
}