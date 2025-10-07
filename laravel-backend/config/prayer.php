<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Prayer Times Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the Prayer Times API
    |
    */

    // Cache TTL in seconds (default: 1 hour)
    'cache_ttl' => env('PRAYER_TIMES_CACHE_TTL', 3600),

    // Default location (Banda Aceh, Indonesia)
    'default_city' => env('PRAYER_TIMES_DEFAULT_CITY', 'Banda Aceh'),
    'default_latitude' => env('PRAYER_TIMES_DEFAULT_LAT', 5.5483),
    'default_longitude' => env('PRAYER_TIMES_DEFAULT_LON', 95.3238),

    // Prayer calculation method
    'calculation_method' => env('PRAYER_CALCULATION_METHOD', 'indonesia'),

    // Fajr angle (degrees below horizon)
    'fajr_angle' => env('PRAYER_FAJR_ANGLE', 18),

    // Isha angle (degrees below horizon)
    'isha_angle' => env('PRAYER_ISHA_ANGLE', 17),

    // Asr calculation method
    // 'standard' = Shafi'i, Maliki, Hanbali (shadow = object length)
    // 'hanafi' = Hanafi (shadow = 2 * object length)
    'asr_method' => env('PRAYER_ASR_METHOD', 'standard'),

    // High latitude adjustment method
    // 'none', 'middle_of_night', 'one_seventh', 'angle_based'
    'high_latitude_adjustment' => env('PRAYER_HIGH_LATITUDE_ADJUSTMENT', 'none'),

    // Indonesian timezone mapping
    'timezones' => [
        'wib' => [
            'name' => 'Asia/Jakarta',
            'offset' => 7,
            'longitude_range' => [-180, 105]
        ],
        'wita' => [
            'name' => 'Asia/Makassar',
            'offset' => 8,
            'longitude_range' => [105, 120]
        ],
        'wit' => [
            'name' => 'Asia/Jayapura',
            'offset' => 9,
            'longitude_range' => [120, 180]
        ]
    ],

    // API rate limiting
    'rate_limit' => [
        'requests' => env('API_RATE_LIMIT', 60),
        'window' => env('API_RATE_LIMIT_WINDOW', 1), // minutes
    ],

    // CORS configuration
    'cors' => [
        'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
        'allowed_methods' => explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
        'allowed_headers' => explode(',', env('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')),
    ],

    // Database cleanup settings
    'cleanup' => [
        // Delete prayer times older than this many days
        'old_prayer_times_days' => env('CLEANUP_OLD_PRAYER_TIMES_DAYS', 30),
        
        // Run cleanup automatically
        'auto_cleanup' => env('CLEANUP_AUTO_CLEANUP', true),
    ],

    // Logging
    'logging' => [
        'enabled' => env('PRAYER_LOGGING_ENABLED', true),
        'level' => env('PRAYER_LOGGING_LEVEL', 'info'),
        'channels' => ['daily'],
    ],
];