<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    /**
     * Get all cities
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $province = $request->query('province');
            $perPage = $request->query('per_page', 100);

            $cacheKey = "cities_" . md5($search . $province . $perPage);

            $cities = Cache::remember($cacheKey, 3600, function () use ($search, $province, $perPage) {
                $query = City::active()->orderBy('province')->orderBy('name');

                if ($search) {
                    $query->search($search);
                }

                if ($province) {
                    $query->where('province', $province);
                }

                return $query->paginate($perPage);
            });

            return response()->json($cities);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get cities',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cities grouped by province
     */
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

    /**
     * Get all provinces
     */
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

    /**
     * Get city by ID
     */
    public function show(City $city): JsonResponse
    {
        try {
            return response()->json($city);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'City not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Search cities
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'q' => 'required|string|min:2'
            ]);

            $query = $request->q;
            $limit = $request->query('limit', 10);

            $cities = City::active()
                ->search($query)
                ->limit($limit)
                ->get();

            return response()->json($cities);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Search failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}