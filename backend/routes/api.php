<?php

use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\PrayerTimeController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', [HealthController::class, 'check']);

// Prayer times
Route::prefix('prayer-times')->group(function () {
    Route::get('/', [PrayerTimeController::class, 'index']);
    Route::get('/current', [PrayerTimeController::class, 'current']);
});

// Cities
Route::prefix('cities')->group(function () {
    Route::get('/', [CityController::class, 'index']);
    Route::get('/grouped', [CityController::class, 'grouped']);
    Route::get('/provinces', [CityController::class, 'provinces']);
});

// Fallback
Route::fallback(function () {
    return response()->json([
        'error' => 'API endpoint not found',
        'available_endpoints' => [
            'GET /api/health',
            'GET /api/prayer-times',
            'GET /api/prayer-times/current',
            'GET /api/cities',
            'GET /api/cities/grouped',
            'GET /api/cities/provinces',
        ]
    ], 404);
});