<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            // ACEH (15 kota/kabupaten)
            ['name' => 'Banda Aceh', 'province' => 'Aceh', 'latitude' => 5.5483, 'longitude' => 95.3238, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Lhokseumawe', 'province' => 'Aceh', 'latitude' => 5.1870, 'longitude' => 97.1413, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Langsa', 'province' => 'Aceh', 'latitude' => 4.4683, 'longitude' => 97.9683, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Sabang', 'province' => 'Aceh', 'latitude' => 5.8947, 'longitude' => 95.3222, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Meulaboh', 'province' => 'Aceh', 'latitude' => 4.1372, 'longitude' => 96.1266, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Sigli', 'province' => 'Aceh', 'latitude' => 5.3864, 'longitude' => 95.9619, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Bireuen', 'province' => 'Aceh', 'latitude' => 5.2030, 'longitude' => 96.7017, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Takengon', 'province' => 'Aceh', 'latitude' => 4.6272, 'longitude' => 96.8286, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Calang', 'province' => 'Aceh', 'latitude' => 4.3667, 'longitude' => 95.6667, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Jantho', 'province' => 'Aceh', 'latitude' => 5.2833, 'longitude' => 95.6167, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Kutacane', 'province' => 'Aceh', 'latitude' => 3.7333, 'longitude' => 97.9167, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Blangkejeren', 'province' => 'Aceh', 'latitude' => 4.1667, 'longitude' => 97.1667, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Idi', 'province' => 'Aceh', 'latitude' => 4.9167, 'longitude' => 97.8333, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Tapaktuan', 'province' => 'Aceh', 'latitude' => 3.2667, 'longitude' => 97.2000, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Subulussalam', 'province' => 'Aceh', 'latitude' => 2.6667, 'longitude' => 97.9500, 'timezone' => 'Asia/Jakarta'],

            // SUMATERA UTARA (8 kota)
            ['name' => 'Medan', 'province' => 'Sumatera Utara', 'latitude' => 3.5952, 'longitude' => 98.6722, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Binjai', 'province' => 'Sumatera Utara', 'latitude' => 3.6000, 'longitude' => 98.4833, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Tebing Tinggi', 'province' => 'Sumatera Utara', 'latitude' => 3.3281, 'longitude' => 99.1625, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Pematangsiantar', 'province' => 'Sumatera Utara', 'latitude' => 2.9667, 'longitude' => 99.0667, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Tanjungbalai', 'province' => 'Sumatera Utara', 'latitude' => 2.9667, 'longitude' => 99.8000, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Sibolga', 'province' => 'Sumatera Utara', 'latitude' => 1.7425, 'longitude' => 98.7792, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Padangsidimpuan', 'province' => 'Sumatera Utara', 'latitude' => 1.3833, 'longitude' => 99.2667, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Gunungsitoli', 'province' => 'Sumatera Utara', 'latitude' => 1.2833, 'longitude' => 97.6167, 'timezone' => 'Asia/Jakarta'],

            // SUMATERA BARAT (4 kota)
            ['name' => 'Padang', 'province' => 'Sumatera Barat', 'latitude' => -0.9471, 'longitude' => 100.4172, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Bukittinggi', 'province' => 'Sumatera Barat', 'latitude' => -0.3056, 'longitude' => 100.3692, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Payakumbuh', 'province' => 'Sumatera Barat', 'latitude' => -0.2167, 'longitude' => 100.6333, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Padangpanjang', 'province' => 'Sumatera Barat', 'latitude' => -0.4667, 'longitude' => 100.4000, 'timezone' => 'Asia/Jakarta'],

            // RIAU (3 kota)
            ['name' => 'Pekanbaru', 'province' => 'Riau', 'latitude' => 0.5071, 'longitude' => 101.4478, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Dumai', 'province' => 'Riau', 'latitude' => 1.6667, 'longitude' => 101.4500, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Batam', 'province' => 'Kepulauan Riau', 'latitude' => 1.1304, 'longitude' => 104.0530, 'timezone' => 'Asia/Jakarta'],

            // JAMBI & BENGKULU (3 kota)
            ['name' => 'Jambi', 'province' => 'Jambi', 'latitude' => -1.6101, 'longitude' => 103.6131, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Bengkulu', 'province' => 'Bengkulu', 'latitude' => -3.7928, 'longitude' => 102.2607, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Curup', 'province' => 'Bengkulu', 'latitude' => -3.4667, 'longitude' => 102.5167, 'timezone' => 'Asia/Jakarta'],

            // SUMATERA SELATAN (3 kota)
            ['name' => 'Palembang', 'province' => 'Sumatera Selatan', 'latitude' => -2.9909, 'longitude' => 104.7566, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Lubuklinggau', 'province' => 'Sumatera Selatan', 'latitude' => -3.3000, 'longitude' => 102.8667, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Prabumulih', 'province' => 'Sumatera Selatan', 'latitude' => -3.4333, 'longitude' => 104.2333, 'timezone' => 'Asia/Jakarta'],

            // LAMPUNG (2 kota)
            ['name' => 'Bandar Lampung', 'province' => 'Lampung', 'latitude' => -5.4292, 'longitude' => 105.2610, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Metro', 'province' => 'Lampung', 'latitude' => -5.1133, 'longitude' => 105.3067, 'timezone' => 'Asia/Jakarta'],

            // JAWA BARAT (5 kota)
            ['name' => 'Bandung', 'province' => 'Jawa Barat', 'latitude' => -6.9175, 'longitude' => 107.6191, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Bekasi', 'province' => 'Jawa Barat', 'latitude' => -6.2383, 'longitude' => 106.9756, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Bogor', 'province' => 'Jawa Barat', 'latitude' => -6.5944, 'longitude' => 106.7892, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Depok', 'province' => 'Jawa Barat', 'latitude' => -6.4025, 'longitude' => 106.7942, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Cirebon', 'province' => 'Jawa Barat', 'latitude' => -6.7063, 'longitude' => 108.5571, 'timezone' => 'Asia/Jakarta'],

            // DKI JAKARTA (1 kota)
            ['name' => 'Jakarta', 'province' => 'DKI Jakarta', 'latitude' => -6.2088, 'longitude' => 106.8456, 'timezone' => 'Asia/Jakarta'],

            // JAWA TENGAH (4 kota)
            ['name' => 'Semarang', 'province' => 'Jawa Tengah', 'latitude' => -6.9667, 'longitude' => 110.4167, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Solo', 'province' => 'Jawa Tengah', 'latitude' => -7.5663, 'longitude' => 110.8281, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Yogyakarta', 'province' => 'DI Yogyakarta', 'latitude' => -7.8014, 'longitude' => 110.3647, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Magelang', 'province' => 'Jawa Tengah', 'latitude' => -7.4697, 'longitude' => 110.2175, 'timezone' => 'Asia/Jakarta'],

            // JAWA TIMUR (4 kota)
            ['name' => 'Surabaya', 'province' => 'Jawa Timur', 'latitude' => -7.2504, 'longitude' => 112.7688, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Malang', 'province' => 'Jawa Timur', 'latitude' => -7.9797, 'longitude' => 112.6304, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Kediri', 'province' => 'Jawa Timur', 'latitude' => -7.8167, 'longitude' => 112.0167, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Probolinggo', 'province' => 'Jawa Timur', 'latitude' => -7.7542, 'longitude' => 113.2159, 'timezone' => 'Asia/Jakarta'],

            // BALI & NUSA TENGGARA (3 kota)
            ['name' => 'Denpasar', 'province' => 'Bali', 'latitude' => -8.6500, 'longitude' => 115.2167, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Mataram', 'province' => 'Nusa Tenggara Barat', 'latitude' => -8.5833, 'longitude' => 116.1167, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Kupang', 'province' => 'Nusa Tenggara Timur', 'latitude' => -10.1718, 'longitude' => 123.6075, 'timezone' => 'Asia/Makassar'],

            // KALIMANTAN (4 kota)
            ['name' => 'Pontianak', 'province' => 'Kalimantan Barat', 'latitude' => 0.0263, 'longitude' => 109.3425, 'timezone' => 'Asia/Jakarta'],
            ['name' => 'Banjarmasin', 'province' => 'Kalimantan Selatan', 'latitude' => -3.3194, 'longitude' => 114.5906, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur', 'latitude' => -1.2654, 'longitude' => 116.8312, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Samarinda', 'province' => 'Kalimantan Timur', 'latitude' => -0.5022, 'longitude' => 117.1536, 'timezone' => 'Asia/Makassar'],

            // SULAWESI (4 kota)
            ['name' => 'Makassar', 'province' => 'Sulawesi Selatan', 'latitude' => -5.1477, 'longitude' => 119.4327, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Manado', 'province' => 'Sulawesi Utara', 'latitude' => 1.4748, 'longitude' => 124.8421, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Palu', 'province' => 'Sulawesi Tengah', 'latitude' => -0.8917, 'longitude' => 119.8707, 'timezone' => 'Asia/Makassar'],
            ['name' => 'Kendari', 'province' => 'Sulawesi Tenggara', 'latitude' => -3.9450, 'longitude' => 122.4989, 'timezone' => 'Asia/Makassar'],

            // MALUKU & PAPUA (3 kota)
            ['name' => 'Ambon', 'province' => 'Maluku', 'latitude' => -3.6954, 'longitude' => 128.1814, 'timezone' => 'Asia/Jayapura'],
            ['name' => 'Jayapura', 'province' => 'Papua', 'latitude' => -2.5337, 'longitude' => 140.7181, 'timezone' => 'Asia/Jayapura'],
            ['name' => 'Sorong', 'province' => 'Papua Barat', 'latitude' => -0.8833, 'longitude' => 131.2500, 'timezone' => 'Asia/Jayapura'],
        ];

        foreach ($cities as $city) {
            City::updateOrCreate(
                ['name' => $city['name'], 'province' => $city['province']],
                $city
            );
        }

        $this->command->info('Successfully seeded ' . count($cities) . ' cities');
    }
}