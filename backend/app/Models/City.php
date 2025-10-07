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
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function prayerTimes(): HasMany
    {
        return $this->hasMany(PrayerTime::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('province', 'LIKE', "%{$search}%");
        });
    }

    public function getTimezoneAttribute(): string
    {
        if ($this->longitude < 105) {
            return 'Asia/Jakarta'; // WIB
        } elseif ($this->longitude < 120) {
            return 'Asia/Makassar'; // WITA
        } else {
            return 'Asia/Jayapura'; // WIT
        }
    }
}