# 🕌 Jadwal Shalat Indonesia v3.0.0

Aplikasi jadwal shalat modern dengan **Laravel Backend** dan **React Frontend**, mendukung **53+ kota Indonesia** termasuk seluruh daerah Aceh, dengan perhitungan waktu shalat yang akurat menggunakan metode Kementerian Agama Indonesia.

![Jadwal Shalat Indonesia](https://img.shields.io/badge/Version-3.0.0-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-10.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Kota yang Didukung](#-kota-yang-didukung)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Prasyarat](#-prasyarat)
- [Instalasi Backend](#-instalasi-backend-laravel)
- [Instalasi Frontend](#-instalasi-frontend-react)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Fitur Utama

### 🎯 **Fitur Inti**
- ✅ **Jadwal Shalat Akurat** - Perhitungan menggunakan algoritma Islamic dengan metode Kemenag
- ✅ **53+ Kota Indonesia** - Data lengkap dari Sabang sampai Merauke, fokus Aceh (15 kota)
- ✅ **Deteksi Lokasi Otomatis** - GPS/Geolocation dengan fallback manual
- ✅ **Real-time Updates** - Auto-refresh setiap 5 menit untuk prayer times, 1 menit untuk current prayer
- ✅ **Current Prayer Info** - Info shalat saat ini dan countdown ke shalat berikutnya
- ✅ **Timezone Indonesia** - Otomatis WIB/WITA/WIT berdasarkan longitude
- ✅ **Responsive Design** - Optimal di desktop, tablet, dan mobile

### 🚀 **Fitur Teknis**
- ✅ **Laravel 10 Backend** - RESTful API dengan caching Redis
- ✅ **React 18 Frontend** - Modern UI dengan TypeScript
- ✅ **Database Caching** - MySQL/PostgreSQL dengan Redis cache
- ✅ **Health Monitoring** - Health check dan status monitoring
- ✅ **Error Handling** - Comprehensive error handling
- ✅ **Rate Limiting** - API protection dari spam requests
- ✅ **CORS Support** - Secure cross-origin configuration

## 🏙️ Kota yang Didukung

### **ACEH (15 kota/kabupaten)**
- Banda Aceh, Lhokseumawe, Langsa, Sabang
- Meulaboh, Sigli, Bireuen, Takengon
- Calang, Jantho, Kutacane, Blangkejeren
- Idi, Tapaktuan, Subulussalam

### **SUMATERA (15 kota)**
- **Sumatera Utara**: Medan, Binjai, Tebing Tinggi, Pematangsiantar, Tanjungbalai, Sibolga, Padangsidimpuan, Gunungsitoli
- **Sumatera Barat**: Padang, Bukittinggi, Payakumbuh, Padangpanjang
- **Riau**: Pekanbaru, Dumai, Batam
- **Jambi & Bengkulu**: Jambi, Bengkulu, Curup
- **Sumatera Selatan**: Palembang, Lubuklinggau, Prabumulih
- **Lampung**: Bandar Lampung, Metro

### **JAWA (14 kota)**
- **Jawa Barat**: Bandung, Bekasi, Bogor, Depok, Cirebon
- **DKI Jakarta**: Jakarta
- **Jawa Tengah**: Semarang, Solo, Magelang
- **DI Yogyakarta**: Yogyakarta
- **Jawa Timur**: Surabaya, Malang, Kediri, Probolinggo

### **INDONESIA TIMUR (10 kota)**
- **Bali & Nusa Tenggara**: Denpasar, Mataram, Kupang
- **Kalimantan**: Pontianak, Banjarmasin, Balikpapan, Samarinda
- **Sulawesi**: Makassar, Manado, Palu, Kendari
- **Maluku & Papua**: Ambon, Jayapura, Sorong

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React + TS    │◄──►│   Laravel API   │◄──►│  MySQL/PgSQL    │
│   + Tailwind    │    │   + Redis       │    │  + Redis Cache  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Laravel 10 + PHP 8.1+ + Redis
- **Database**: MySQL 8.0+ atau PostgreSQL 13+
- **Deployment**: Docker + Cloud platforms

## 📋 Prasyarat

Pastikan sistem Anda memiliki:

- **PHP** 8.1+ ([Download](https://php.net/downloads))
- **Composer** 2.0+ ([Download](https://getcomposer.org/download/))
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MySQL** 8.0+ atau **PostgreSQL** 13+
- **Redis** (optional, untuk caching)

### Verifikasi Instalasi:
```bash
php --version     # PHP 8.1.0+
composer --version # Composer 2.0.0+
node --version    # v18.0.0+
mysql --version   # MySQL 8.0.0+
```

## 🚀 Instalasi Backend (Laravel)

### 1. Setup Database
```bash
# MySQL
mysql -u root -p
CREATE DATABASE prayer_times;
CREATE USER 'prayer_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON prayer_times.* TO 'prayer_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Atau PostgreSQL
createdb prayer_times
```

### 2. Install Dependencies
```bash
cd backend
composer install
```

### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Database
Edit `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prayer_times
DB_USERNAME=prayer_user
DB_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_DRIVER=redis
```

### 5. Database Migration & Seeding
```bash
php artisan migrate
php artisan db:seed --class=CitySeeder
```

### 6. Start Laravel Server
```bash
php artisan serve
```

Backend API akan berjalan di `http://localhost:8000`

### 7. Test API
```bash
# Health check
curl http://localhost:8000/api/health

# Get cities
curl http://localhost:8000/api/cities

# Prayer times for Banda Aceh
curl "http://localhost:8000/api/prayer-times?city=Banda Aceh"
```

## 🎨 Instalasi Frontend (React)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Build untuk Production
```bash
npm run build
npm run preview
```

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "time": "2024-01-04T10:30:00Z",
  "version": "3.0.0",
  "database": "connected",
  "cities_count": 53,
  "cache": "working"
}
```

#### 2. Get Cities
```http
GET /api/cities
GET /api/cities/grouped
GET /api/cities/provinces
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Banda Aceh",
    "province": "Aceh",
    "country": "Indonesia",
    "latitude": 5.5483,
    "longitude": 95.3238,
    "is_active": true
  }
]
```

#### 3. Get Prayer Times
```http
GET /api/prayer-times?city={city}&date={date}
GET /api/prayer-times?latitude={lat}&longitude={lon}&date={date}
```

**Parameters:**
- `city` (optional): Nama kota (e.g., "Banda Aceh")
- `latitude` (optional): Latitude lokasi
- `longitude` (optional): Longitude lokasi  
- `date` (optional): Tanggal (YYYY-MM-DD, default: hari ini)

**Response:**
```json
{
  "date": "2024-01-04",
  "latitude": 5.5483,
  "longitude": 95.3238,
  "city": "Banda Aceh",
  "timezone": "Asia/Jakarta",
  "fajr": "04:30",
  "sunrise": "05:45",
  "dhuhr": "12:00",
  "asr": "15:15",
  "maghrib": "18:00",
  "isha": "19:15"
}
```

#### 4. Get Current Prayer Info
```http
GET /api/prayer-times/current?latitude={lat}&longitude={lon}
```

**Response:**
```json
{
  "current_prayer": "Dhuhr",
  "next_prayer": "Asr",
  "time_until_next": "3 jam 15 menit",
  "prayer_times": {
    "date": "2024-01-04",
    "fajr": "04:30",
    "sunrise": "05:45",
    "dhuhr": "12:00",
    "asr": "15:15",
    "maghrib": "18:00",
    "isha": "19:15"
  }
}
```

### Contoh Penggunaan API

#### JavaScript/TypeScript
```javascript
// Get prayer times for Banda Aceh
const response = await fetch('http://localhost:8000/api/prayer-times?city=Banda Aceh');
const data = await response.json();
console.log(data);

// Get current prayer info
const currentResponse = await fetch('http://localhost:8000/api/prayer-times/current?latitude=5.5483&longitude=95.3238');
const currentData = await currentResponse.json();
console.log(currentData);
```

#### Python
```python
import requests

# Get prayer times for Lhokseumawe
response = requests.get('http://localhost:8000/api/prayer-times', params={
    'city': 'Lhokseumawe'
})
data = response.json()
print(data)
```

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
VITE_API_URL=https://your-backend-domain.com
```

#### Netlify
```bash
# Build
npm run build

# Deploy dist folder ke Netlify
# Set environment variables di Netlify dashboard
```

### Backend Deployment

#### Laravel Forge (Recommended)
1. Create server di Laravel Forge
2. Deploy repository dari GitHub
3. Set environment variables
4. Run migrations: `php artisan migrate --force`
5. Seed database: `php artisan db:seed --class=CitySeeder --force`

#### Heroku
```bash
# Create app
heroku create prayer-times-api

# Set buildpack
heroku buildpacks:set heroku/php

# Set environment variables
heroku config:set APP_KEY=$(php artisan --no-ansi key:generate --show)
heroku config:set DB_CONNECTION=pgsql

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run php artisan migrate --force
heroku run php artisan db:seed --class=CitySeeder --force
```

#### VPS dengan Docker
```bash
# Clone repository
git clone <repository-url>
cd prayer-times-app

# Build dan run dengan Docker Compose
docker-compose up -d

# Atau manual
cd backend
docker build -t prayer-times-api .
docker run -d -p 8000:8000 \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=your_db_host \
  -e DB_DATABASE=prayer_times \
  -e DB_USERNAME=your_username \
  -e DB_PASSWORD=your_password \
  --name prayer-api \
  prayer-times-api
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Application
APP_NAME="Prayer Times API"
APP_ENV=production
APP_KEY=your-app-key
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prayer_times
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Cache
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Prayer Times
PRAYER_CACHE_TTL=3600
PRAYER_DEFAULT_CITY="Banda Aceh"
PRAYER_DEFAULT_LAT=5.5483
PRAYER_DEFAULT_LON=95.3238

# API
API_RATE_LIMIT=100
CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com"
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com

# Optional: Development mode
VITE_DEV_MODE=false
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Test connection
php artisan tinker
DB::connection()->getPdo();

# Check migrations
php artisan migrate:status
```

**Solution:**
- Pastikan database credentials benar di `.env`
- Pastikan database server berjalan
- Run migrations: `php artisan migrate`

#### 2. CORS Error
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Update `CORS_ALLOWED_ORIGINS` di backend `.env`
- Pastikan frontend `VITE_API_URL` benar
- Restart Laravel server

#### 3. Cities Not Loading
```bash
# Check if cities are seeded
php artisan tinker
App\Models\City::count();

# Re-seed if needed
php artisan db:seed --class=CitySeeder --force
```

#### 4. Redis Connection Error
```bash
# Test Redis connection
redis-cli ping

# Or disable Redis caching
# Set CACHE_DRIVER=file in .env
```

#### 5. Permission Issues (Linux/Mac)
```bash
# Fix Laravel permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Debug Mode

#### Backend Debug
```bash
# Enable debug mode
APP_DEBUG=true php artisan serve

# Check logs
tail -f storage/logs/laravel.log
```

#### Frontend Debug
```bash
# Enable development mode
VITE_DEV_MODE=true npm run dev

# Check browser console for errors
```

## 🤝 Contributing

Kami menyambut kontribusi dari komunitas! Berikut cara berkontribusi:

### 1. Fork Repository
```bash
git clone https://github.com/your-username/jadwal-shalat-indonesia.git
cd jadwal-shalat-indonesia
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Ikuti coding standards yang ada
- Tambahkan tests jika diperlukan
- Update documentation

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push dan Create PR
```bash
git push origin feature/amazing-feature
```

### Development Guidelines

#### Code Style
- **PHP**: Follow PSR-12 standards, use `php artisan pint`
- **TypeScript**: Use Prettier dan ESLint
- **Commits**: Use conventional commits

#### Testing
```bash
# Backend tests
cd backend
php artisan test

# Frontend tests  
npm test
```

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.

## 🙏 Acknowledgments

- [Laravel Framework](https://laravel.com) - PHP web framework
- [React](https://reactjs.org) - JavaScript library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide React](https://lucide.dev) - Icon library
- Islamic prayer time algorithms
- Indonesian cities database
- Open source community

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. **Check Documentation** - Baca README ini dengan teliti
2. **Search Issues** - Cek [GitHub Issues](https://github.com/username/jadwal-shalat-indonesia/issues)
3. **Create Issue** - Buat issue baru dengan detail yang lengkap
4. **Join Discussion** - Bergabung di [GitHub Discussions](https://github.com/username/jadwal-shalat-indonesia/discussions)

---

**Dibuat dengan ❤️ untuk umat Muslim Indonesia**

*Semoga aplikasi ini bermanfaat untuk membantu ibadah shalat kita semua. Aamiin.* 🤲

## 🆕 Changelog v3.0.0

### ✨ New Features
- 🔄 **Complete Rewrite** - Migrated from Golang to Laravel backend
- 🏙️ **53+ Kota Indonesia** - Comprehensive city database including all Aceh regions
- 🎨 **Modern UI** - Completely redesigned React frontend with Tailwind CSS
- ⚡ **Enhanced Performance** - Redis caching and optimized database queries
- 🔍 **Smart Location Search** - Province-based grouping and search functionality
- 📊 **Better Monitoring** - Comprehensive health checks and API status
- 🌐 **Improved CORS** - Better cross-origin resource sharing configuration
- 🔒 **Enhanced Security** - Rate limiting and input validation

### 🐛 Bug Fixes
- 🔧 Fixed timezone detection for Indonesian regions
- 🔧 Improved error handling and user feedback
- 🔧 Better responsive design for mobile devices
- 🔧 Enhanced API timeout handling

### 🏗️ Technical Improvements
- 📦 Laravel 10 backend with modern PHP practices
- 🎯 TypeScript for better type safety
- 🐳 Docker support for easy deployment
- 📝 Comprehensive API documentation
- 🧪 Better testing infrastructure
- 🔄 Auto-refresh functionality for real-time updates