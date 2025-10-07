<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->nullable()->constrained()->onDelete('set null');
            $table->date('date')->index();
            $table->time('fajr');
            $table->time('sunrise');
            $table->time('dhuhr');
            $table->time('asr');
            $table->time('maghrib');
            $table->time('isha');
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 10, 6);
            $table->timestamps();

            $table->index(['date', 'latitude', 'longitude']);
            $table->index(['city_id', 'date']);
            $table->unique(['date', 'latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_times');
    }
};