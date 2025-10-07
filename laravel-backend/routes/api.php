<?php

use App\Http\Controllers\CityController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\PrayerTimeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check routes
Route::get('/health', [HealthController::class, 'check']);
Route::get('/health/info', [HealthController::class, 'info']);

// Prayer times routes
Route::prefix('prayer-times')->group(function () {
    Route::get('/', [PrayerTimeController::class, 'index']);
    Route::get('/current', [PrayerTimeController::class, 'current']);
    Route::get('/monthly', [PrayerTimeController::class, 'monthly']);
});

// Cities routes
Route::prefix('cities')->group(function () {
    Route::get('/', [CityController::class, 'index']);
    Route::get('/grouped', [CityController::class, 'grouped']);
    Route::get('/provinces', [CityController::class, 'provinces']);
    Route::get('/search', [CityController::class, 'search']);
    Route::get('/{city}', [CityController::class, 'show']);
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'error' => 'API endpoint not found',
        'message' => 'The requested API endpoint does not exist',
        'available_endpoints' => [
            'GET /api/health' => 'Health check',
            'GET /api/prayer-times' => 'Get prayer times',
            'GET /api/prayer-times/current' => 'Get current prayer info',
            'GET /api/prayer-times/monthly' => 'Get monthly prayer times',
            'GET /api/cities' => 'Get all cities',
            'GET /api/cities/grouped' => 'Get cities grouped by province',
            'GET /api/cities/provinces' => 'Get all provinces',
            'GET /api/cities/search' => 'Search cities',
        ]
    ], 404);
});