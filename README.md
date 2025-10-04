# Aplikasi Jadwal Shalat

Aplikasi jadwal shalat dengan backend API Golang yang dapat dibagikan ke orang lain.

## 🏗️ Arsitektur

- **Frontend**: React + TypeScript + Vite
- **Backend**: Golang REST API
- **Database**: Supabase PostgreSQL
- **Deployment**: Backend dapat di-deploy ke mana saja (VPS, Cloud Run, Heroku, dll)

## 📋 Fitur

- ✅ Menampilkan jadwal shalat berdasarkan koordinat lokasi
- ✅ Deteksi lokasi otomatis menggunakan GPS
- ✅ Input lokasi manual
- ✅ Menampilkan waktu shalat saat ini dan berikutnya
- ✅ Countdown ke waktu shalat berikutnya
- ✅ API publik yang bisa dibagikan
- ✅ Caching data di database untuk performa optimal
- ✅ Responsive design

## 🚀 Cara Menjalankan

### 1. Setup Database

Database Supabase sudah disiapkan. Dapatkan connection string dari Supabase dashboard Anda.

### 2. Setup Backend (Golang)

```bash
cd backend

# Install dependencies
go mod download

# Setup environment variables
cp .env.example .env
# Edit .env dan isi DATABASE_URL dengan connection string Supabase Anda

# Jalankan server
go run main.go
```

Server akan berjalan di `http://localhost:8080`

### 3. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dan isi:
# - VITE_SUPABASE_URL dengan URL Supabase Anda
# - VITE_SUPABASE_ANON_KEY dengan Anon Key Supabase Anda
# - VITE_API_URL=http://localhost:8080 (atau URL backend yang sudah di-deploy)

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### 1. Get Prayer Times
Mendapatkan jadwal shalat untuk lokasi dan tanggal tertentu.

```http
GET /api/prayer-times?latitude={lat}&longitude={lon}&date={date}&city={city}
```

**Query Parameters:**
- `latitude` (required): Latitude lokasi (contoh: -6.2088)
- `longitude` (required): Longitude lokasi (contoh: 106.8456)
- `date` (optional): Tanggal dalam format YYYY-MM-DD (default: hari ini)
- `city` (optional): Nama kota untuk label

**Response:**
```json
{
  "date": "2024-10-04",
  "fajr": "04:30",
  "sunrise": "05:45",
  "dhuhr": "12:00",
  "asr": "15:15",
  "maghrib": "18:00",
  "isha": "19:15",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "city": "Jakarta"
}
```

**Contoh Request:**
```bash
curl "http://localhost:8080/api/prayer-times?latitude=-6.2088&longitude=106.8456&city=Jakarta"
```

#### 2. Get Current Prayer Info
Mendapatkan informasi waktu shalat saat ini dan berikutnya.

```http
GET /api/prayer-times/current?latitude={lat}&longitude={lon}
```

**Query Parameters:**
- `latitude` (required): Latitude lokasi
- `longitude` (required): Longitude lokasi

**Response:**
```json
{
  "current_prayer": "Dhuhr",
  "next_prayer": "Asr",
  "time_until_next": "3h 15m",
  "prayer_times": {
    "date": "2024-10-04",
    "fajr": "04:30",
    "sunrise": "05:45",
    "dhuhr": "12:00",
    "asr": "15:15",
    "maghrib": "18:00",
    "isha": "19:15",
    "latitude": -6.2088,
    "longitude": 106.8456
  }
}
```

**Contoh Request:**
```bash
curl "http://localhost:8080/api/prayer-times/current?latitude=-6.2088&longitude=106.8456"
```

#### 3. Health Check
Mengecek status kesehatan API.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "time": "2024-10-04T10:30:00Z"
}
```

## 🌐 Deploy Backend ke Production

### Option 1: Deploy ke VPS

1. Copy file backend ke VPS Anda
2. Install Go di VPS
3. Build aplikasi:
```bash
go build -o prayer-times-api main.go
```
4. Setup systemd service atau gunakan process manager seperti PM2
5. Jalankan aplikasi:
```bash
./prayer-times-api
```

### Option 2: Deploy menggunakan Docker

```bash
cd backend

# Build Docker image
docker build -t prayer-times-api .

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  prayer-times-api
```

### Option 3: Deploy ke Cloud Run (Google Cloud)

```bash
cd backend

# Build dan push ke Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/prayer-times-api

# Deploy ke Cloud Run
gcloud run deploy prayer-times-api \
  --image gcr.io/YOUR_PROJECT_ID/prayer-times-api \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your_database_url"
```

### Option 4: Deploy ke Heroku

```bash
cd backend

# Login ke Heroku
heroku login

# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/go

# Set environment variables
heroku config:set DATABASE_URL="your_database_url"

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8080
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8080
```

## 📱 Membagikan API ke Orang Lain

Setelah backend di-deploy, Anda bisa membagikan API endpoint kepada orang lain:

1. Berikan base URL API (contoh: `https://your-api.com`)
2. Share dokumentasi endpoint di atas
3. Pastikan CORS sudah diaktifkan (sudah ter-konfigurasi di kode)

Contoh penggunaan untuk developer lain:

```javascript
// JavaScript/TypeScript
const response = await fetch('https://your-api.com/api/prayer-times?latitude=-6.2088&longitude=106.8456');
const data = await response.json();
console.log(data);
```

```python
# Python
import requests

response = requests.get('https://your-api.com/api/prayer-times', params={
    'latitude': -6.2088,
    'longitude': 106.8456
})
data = response.json()
print(data)
```

```php
// PHP
$url = 'https://your-api.com/api/prayer-times?latitude=-6.2088&longitude=106.8456';
$response = file_get_contents($url);
$data = json_decode($response, true);
print_r($data);
```

## 🗄️ Database Schema

Tabel `prayer_times_cache` digunakan untuk caching hasil perhitungan:

```sql
CREATE TABLE prayer_times_cache (
  id uuid PRIMARY KEY,
  date date NOT NULL,
  fajr text NOT NULL,
  sunrise text NOT NULL,
  dhuhr text NOT NULL,
  asr text NOT NULL,
  maghrib text NOT NULL,
  isha text NOT NULL,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, latitude, longitude)
);
```

## 📝 Catatan

- Perhitungan waktu shalat menggunakan metode standar dengan angle 18° untuk Fajr dan Isha
- Data di-cache selama 7 hari untuk meningkatkan performa
- API sudah menggunakan CORS untuk bisa diakses dari berbagai domain
- Backend tidak memerlukan authentication, sehingga bersifat publik

## 🤝 Kontribusi

Silakan fork dan buat pull request untuk kontribusi!

## 📄 License

MIT License
