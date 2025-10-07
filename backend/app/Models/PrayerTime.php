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
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function getCurrentPrayer(): ?string
    {
        $now = Carbon::now()->format('H:i');
        $prayers = [
            'fajr' => $this->fajr,
            'sunrise' => $this->sunrise,
            'dhuhr' => $this->dhuhr,
            'asr' => $this->asr,
            'maghrib' => $this->maghrib,
            'isha' => $this->isha,
        ];

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

    public function getNextPrayer(): string
    {
        $now = Carbon::now()->format('H:i');
        $prayers = [
            'fajr' => $this->fajr,
            'sunrise' => $this->sunrise,
            'dhuhr' => $this->dhuhr,
            'asr' => $this->asr,
            'maghrib' => $this->maghrib,
            'isha' => $this->isha,
        ];

        foreach ($prayers as $name => $time) {
            if ($now < $time) {
                return $name;
            }
        }

        return 'fajr'; // Next day
    }

    public function scopeToday($query)
    {
        return $query->where('date', Carbon::today());
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('date', $date);
    }
}