<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->index();
            $table->string('province', 100)->index();
            $table->string('country', 100)->default('Indonesia');
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 10, 6);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
            $table->index(['province', 'name']);
            $table->unique(['name', 'province']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};