<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $province = $request->query('province');

            $cacheKey = "cities_" . md5($search . $province);

            $cities = Cache::remember($cacheKey, 3600, function () use ($search, $province) {
                $query = City::active()->orderBy('province')->orderBy('name');

                if ($search) {
                    $query->search($search);
                }

                if ($province) {
                    $query->where('province', $province);
                }

                return $query->get();
            });

            return response()->json($cities);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get cities',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function grouped(): JsonResponse
    {
        try {
            $cities = Cache::remember('cities_grouped', 3600, function () {
                return City::active()
                    ->orderBy('province')
                    ->orderBy('name')
                    ->get()
                    ->groupBy('province')
                    ->map(function ($cities) {
                        return $cities->values();
                    });
            });

            return response()->json($cities);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get grouped cities',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function provinces(): JsonResponse
    {
        try {
            $provinces = Cache::remember('provinces', 3600, function () {
                return City::active()
                    ->select('province')
                    ->distinct()
                    ->orderBy('province')
                    ->pluck('province');
            });

            return response()->json($provinces);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get provinces',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}