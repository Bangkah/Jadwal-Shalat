<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            // ACEH (15 kota/kabupaten)
            ['name' => 'Banda Aceh', 'province' => 'Aceh', 'latitude' => 5.5483, 'longitude' => 95.3238],
            ['name' => 'Lhokseumawe', 'province' => 'Aceh', 'latitude' => 5.1870, 'longitude' => 97.1413],
            ['name' => 'Langsa', 'province' => 'Aceh', 'latitude' => 4.4683, 'longitude' => 97.9683],
            ['name' => 'Sabang', 'province' => 'Aceh', 'latitude' => 5.8947, 'longitude' => 95.3222],
            ['name' => 'Meulaboh', 'province' => 'Aceh', 'latitude' => 4.1372, 'longitude' => 96.1266],
            ['name' => 'Sigli', 'province' => 'Aceh', 'latitude' => 5.3864, 'longitude' => 95.9619],
            ['name' => 'Bireuen', 'province' => 'Aceh', 'latitude' => 5.2030, 'longitude' => 96.7017],
            ['name' => 'Takengon', 'province' => 'Aceh', 'latitude' => 4.6272, 'longitude' => 96.8286],
            ['name' => 'Calang', 'province' => 'Aceh', 'latitude' => 4.3667, 'longitude' => 95.6667],
            ['name' => 'Jantho', 'province' => 'Aceh', 'latitude' => 5.2833, 'longitude' => 95.6167],
            ['name' => 'Kutacane', 'province' => 'Aceh', 'latitude' => 3.7333, 'longitude' => 97.9167],
            ['name' => 'Blangkejeren', 'province' => 'Aceh', 'latitude' => 4.1667, 'longitude' => 97.1667],
            ['name' => 'Idi', 'province' => 'Aceh', 'latitude' => 4.9167, 'longitude' => 97.8333],
            ['name' => 'Tapaktuan', 'province' => 'Aceh', 'latitude' => 3.2667, 'longitude' => 97.2000],
            ['name' => 'Subulussalam', 'province' => 'Aceh', 'latitude' => 2.6667, 'longitude' => 97.9500],

            // SUMATERA UTARA (8 kota)
            ['name' => 'Medan', 'province' => 'Sumatera Utara', 'latitude' => 3.5952, 'longitude' => 98.6722],
            ['name' => 'Binjai', 'province' => 'Sumatera Utara', 'latitude' => 3.6000, 'longitude' => 98.4833],
            ['name' => 'Tebing Tinggi', 'province' => 'Sumatera Utara', 'latitude' => 3.3281, 'longitude' => 99.1625],
            ['name' => 'Pematangsiantar', 'province' => 'Sumatera Utara', 'latitude' => 2.9667, 'longitude' => 99.0667],
            ['name' => 'Tanjungbalai', 'province' => 'Sumatera Utara', 'latitude' => 2.9667, 'longitude' => 99.8000],
            ['name' => 'Sibolga', 'province' => 'Sumatera Utara', 'latitude' => 1.7425, 'longitude' => 98.7792],
            ['name' => 'Padangsidimpuan', 'province' => 'Sumatera Utara', 'latitude' => 1.3833, 'longitude' => 99.2667],
            ['name' => 'Gunungsitoli', 'province' => 'Sumatera Utara', 'latitude' => 1.2833, 'longitude' => 97.6167],

            // SUMATERA BARAT (4 kota)
            ['name' => 'Padang', 'province' => 'Sumatera Barat', 'latitude' => -0.9471, 'longitude' => 100.4172],
            ['name' => 'Bukittinggi', 'province' => 'Sumatera Barat', 'latitude' => -0.3056, 'longitude' => 100.3692],
            ['name' => 'Payakumbuh', 'province' => 'Sumatera Barat', 'latitude' => -0.2167, 'longitude' => 100.6333],
            ['name' => 'Padangpanjang', 'province' => 'Sumatera Barat', 'latitude' => -0.4667, 'longitude' => 100.4000],

            // RIAU (3 kota)
            ['name' => 'Pekanbaru', 'province' => 'Riau', 'latitude' => 0.5071, 'longitude' => 101.4478],
            ['name' => 'Dumai', 'province' => 'Riau', 'latitude' => 1.6667, 'longitude' => 101.4500],
            ['name' => 'Batam', 'province' => 'Kepulauan Riau', 'latitude' => 1.1304, 'longitude' => 104.0530],

            // JAMBI & BENGKULU (3 kota)
            ['name' => 'Jambi', 'province' => 'Jambi', 'latitude' => -1.6101, 'longitude' => 103.6131],
            ['name' => 'Bengkulu', 'province' => 'Bengkulu', 'latitude' => -3.7928, 'longitude' => 102.2607],
            ['name' => 'Curup', 'province' => 'Bengkulu', 'latitude' => -3.4667, 'longitude' => 102.5167],

            // SUMATERA SELATAN (3 kota)
            ['name' => 'Palembang', 'province' => 'Sumatera Selatan', 'latitude' => -2.9909, 'longitude' => 104.7566],
            ['name' => 'Lubuklinggau', 'province' => 'Sumatera Selatan', 'latitude' => -3.3000, 'longitude' => 102.8667],
            ['name' => 'Prabumulih', 'province' => 'Sumatera Selatan', 'latitude' => -3.4333, 'longitude' => 104.2333],

            // LAMPUNG (2 kota)
            ['name' => 'Bandar Lampung', 'province' => 'Lampung', 'latitude' => -5.4292, 'longitude' => 105.2610],
            ['name' => 'Metro', 'province' => 'Lampung', 'latitude' => -5.1133, 'longitude' => 105.3067],

            // JAWA BARAT (5 kota)
            ['name' => 'Bandung', 'province' => 'Jawa Barat', 'latitude' => -6.9175, 'longitude' => 107.6191],
            ['name' => 'Bekasi', 'province' => 'Jawa Barat', 'latitude' => -6.2383, 'longitude' => 106.9756],
            ['name' => 'Bogor', 'province' => 'Jawa Barat', 'latitude' => -6.5944, 'longitude' => 106.7892],
            ['name' => 'Depok', 'province' => 'Jawa Barat', 'latitude' => -6.4025, 'longitude' => 106.7942],
            ['name' => 'Cirebon', 'province' => 'Jawa Barat', 'latitude' => -6.7063, 'longitude' => 108.5571],

            // DKI JAKARTA (1 kota)
            ['name' => 'Jakarta', 'province' => 'DKI Jakarta', 'latitude' => -6.2088, 'longitude' => 106.8456],

            // JAWA TENGAH (4 kota)
            ['name' => 'Semarang', 'province' => 'Jawa Tengah', 'latitude' => -6.9667, 'longitude' => 110.4167],
            ['name' => 'Solo', 'province' => 'Jawa Tengah', 'latitude' => -7.5663, 'longitude' => 110.8281],
            ['name' => 'Yogyakarta', 'province' => 'DI Yogyakarta', 'latitude' => -7.8014, 'longitude' => 110.3647],
            ['name' => 'Magelang', 'province' => 'Jawa Tengah', 'latitude' => -7.4697, 'longitude' => 110.2175],

            // JAWA TIMUR (4 kota)
            ['name' => 'Surabaya', 'province' => 'Jawa Timur', 'latitude' => -7.2504, 'longitude' => 112.7688],
            ['name' => 'Malang', 'province' => 'Jawa Timur', 'latitude' => -7.9797, 'longitude' => 112.6304],
            ['name' => 'Kediri', 'province' => 'Jawa Timur', 'latitude' => -7.8167, 'longitude' => 112.0167],
            ['name' => 'Probolinggo', 'province' => 'Jawa Timur', 'latitude' => -7.7542, 'longitude' => 113.2159],

            // BALI & NUSA TENGGARA (3 kota)
            ['name' => 'Denpasar', 'province' => 'Bali', 'latitude' => -8.6500, 'longitude' => 115.2167],
            ['name' => 'Mataram', 'province' => 'Nusa Tenggara Barat', 'latitude' => -8.5833, 'longitude' => 116.1167],
            ['name' => 'Kupang', 'province' => 'Nusa Tenggara Timur', 'latitude' => -10.1718, 'longitude' => 123.6075],

            // KALIMANTAN (4 kota)
            ['name' => 'Pontianak', 'province' => 'Kalimantan Barat', 'latitude' => 0.0263, 'longitude' => 109.3425],
            ['name' => 'Banjarmasin', 'province' => 'Kalimantan Selatan', 'latitude' => -3.3194, 'longitude' => 114.5906],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur', 'latitude' => -1.2654, 'longitude' => 116.8312],
            ['name' => 'Samarinda', 'province' => 'Kalimantan Timur', 'latitude' => -0.5022, 'longitude' => 117.1536],

            // SULAWESI (4 kota)
            ['name' => 'Makassar', 'province' => 'Sulawesi Selatan', 'latitude' => -5.1477, 'longitude' => 119.4327],
            ['name' => 'Manado', 'province' => 'Sulawesi Utara', 'latitude' => 1.4748, 'longitude' => 124.8421],
            ['name' => 'Palu', 'province' => 'Sulawesi Tengah', 'latitude' => -0.8917, 'longitude' => 119.8707],
            ['name' => 'Kendari', 'province' => 'Sulawesi Tenggara', 'latitude' => -3.9450, 'longitude' => 122.4989],

            // MALUKU & PAPUA (3 kota)
            ['name' => 'Ambon', 'province' => 'Maluku', 'latitude' => -3.6954, 'longitude' => 128.1814],
            ['name' => 'Jayapura', 'province' => 'Papua', 'latitude' => -2.5337, 'longitude' => 140.7181],
            ['name' => 'Sorong', 'province' => 'Papua Barat', 'latitude' => -0.8833, 'longitude' => 131.2500],
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