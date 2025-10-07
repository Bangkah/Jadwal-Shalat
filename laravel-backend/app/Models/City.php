<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'province',
        'country',
        'latitude',
        'longitude',
        'timezone',
        'is_active'
    ];

    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    /**
     * Get prayer times for this city
     */
    public function prayerTimes(): HasMany
    {
        return $this->hasMany(PrayerTime::class);
    }

    /**
     * Get prayer times for a specific date
     */
    public function prayerTimesForDate(string $date): HasMany
    {
        return $this->prayerTimes()->where('date', $date);
    }

    /**
     * Scope for active cities
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching cities
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('province', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Get Indonesian timezone based on longitude
     */
    public function getIndonesianTimezone(): string
    {
        if ($this->longitude < 105) {
            return 'Asia/Jakarta'; // WIB (UTC+7)
        } elseif ($this->longitude < 120) {
            return 'Asia/Makassar'; // WITA (UTC+8)
        } else {
            return 'Asia/Jayapura'; // WIT (UTC+9)
        }
    }

    /**
     * Get timezone abbreviation
     */
    public function getTimezoneAbbreviation(): string
    {
        $timezone = $this->getIndonesianTimezone();
        return match ($timezone) {
            'Asia/Jakarta' => 'WIB',
            'Asia/Makassar' => 'WITA',
            'Asia/Jayapura' => 'WIT',
            default => 'WIB'
        };
    }
}