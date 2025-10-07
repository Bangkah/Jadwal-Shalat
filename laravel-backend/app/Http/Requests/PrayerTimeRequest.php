<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrayerTimeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'city' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'date' => 'nullable|date|date_format:Y-m-d|after_or_equal:2020-01-01|before_or_equal:2030-12-31'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'latitude.between' => 'Latitude must be between -90 and 90 degrees.',
            'longitude.between' => 'Longitude must be between -180 and 180 degrees.',
            'date.date_format' => 'Date must be in YYYY-MM-DD format.',
            'date.after_or_equal' => 'Date must be from 2020 onwards.',
            'date.before_or_equal' => 'Date must be before 2031.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string coordinates to float
        if ($this->has('latitude')) {
            $this->merge([
                'latitude' => (float) $this->latitude
            ]);
        }

        if ($this->has('longitude')) {
            $this->merge([
                'longitude' => (float) $this->longitude
            ]);
        }

        // Set default date if not provided
        if (!$this->has('date') || empty($this->date)) {
            $this->merge([
                'date' => now()->format('Y-m-d')
            ]);
        }
    }
}