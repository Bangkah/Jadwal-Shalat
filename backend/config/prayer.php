<?php

return [
    'cache_ttl' => env('PRAYER_CACHE_TTL', 3600),
    'default_city' => env('PRAYER_DEFAULT_CITY', 'Banda Aceh'),
    'default_latitude' => env('PRAYER_DEFAULT_LAT', 5.5483),
    'default_longitude' => env('PRAYER_DEFAULT_LON', 95.3238),
    'fajr_angle' => env('PRAYER_FAJR_ANGLE', 18),
    'isha_angle' => env('PRAYER_ISHA_ANGLE', 17),
];