# 🕌 Laravel Prayer Times API

Backend API Laravel untuk aplikasi Jadwal Shalat Indonesia dengan perhitungan waktu shalat yang akurat dan fitur lengkap.

## 🚀 Fitur Utama

### ✨ **Fitur Inti**
- ✅ **Perhitungan Akurat** - Algoritma Islamic prayer times yang presisi
- ✅ **53+ Kota Indonesia** - Data lengkap dari Sabang sampai Merauke
- ✅ **Timezone Indonesia** - Otomatis WIB/WITA/WIT berdasarkan longitude
- ✅ **Database Caching** - Sistem cache yang efisien dengan MySQL/PostgreSQL
- ✅ **RESTful API** - API yang clean dan well-documented
- ✅ **Health Monitoring** - Health check dan system monitoring
- ✅ **Rate Limiting** - Perlindungan dari spam request
- ✅ **CORS Support** - Konfigurasi CORS yang aman

### 🏙️ **Data Kota**
- **ACEH**: 15 kota/kabupaten (Banda Aceh, Lhokseumawe, Langsa, dll)
- **SUMATERA**: 15 kota (Medan, Padang, Pekanbaru, dll)
- **JAWA**: 14 kota (Jakarta, Bandung, Surabaya, dll)
- **INDONESIA TIMUR**: 10 kota (Makassar, Jayapura, dll)

## 📋 Prasyarat

- **PHP** 8.1+
- **Composer** 2.0+
- **MySQL** 8.0+ atau **PostgreSQL** 13+
- **Redis** (optional, untuk caching)

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd laravel-backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database Configuration
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prayer_times
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Database Migration & Seeding
```bash
php artisan migrate
php artisan db:seed --class=CitySeeder
```

### 6. Start Development Server
```bash
php artisan serve
```

API akan berjalan di `http://localhost:8000`

## 📡 API Endpoints

### **Health Check**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "time": "2024-01-04T10:30:00Z",
  "version": "2.1.0",
  "database": {
    "status": "connected",
    "connection": "mysql"
  },
  "cities_count": 53
}
```

### **Get Cities**
```http
GET /api/cities
GET /api/cities/grouped
GET /api/cities/provinces
GET /api/cities/search?q=banda
```

### **Prayer Times**
```http
GET /api/prayer-times?city=Banda Aceh
GET /api/prayer-times?latitude=5.5483&longitude=95.3238
GET /api/prayer-times/current?latitude=5.5483&longitude=95.3238
GET /api/prayer-times/monthly?latitude=5.5483&longitude=95.3238&month=1&year=2024
```

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

## 🔧 Configuration

### Prayer Times Settings
Edit `config/prayer.php`:
```php
'fajr_angle' => 18,
'isha_angle' => 17,
'asr_method' => 'standard', // or 'hanafi'
'cache_ttl' => 3600, // 1 hour
```

### Rate Limiting
```php
'rate_limit' => [
    'requests' => 60,
    'window' => 1, // minutes
],
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM php:8.1-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Build & Run
```bash
docker build -t prayer-times-api .
docker run -p 8000:8000 prayer-times-api
```

## ☁️ Cloud Deployment

### Laravel Forge
1. Create server di Laravel Forge
2. Deploy repository
3. Set environment variables
4. Run migrations

### Heroku
```bash
# Install Heroku CLI
heroku create prayer-times-api

# Set buildpack
heroku buildpacks:set heroku/php

# Set environment variables
heroku config:set APP_KEY=$(php artisan --no-ansi key:generate --show)
heroku config:set DB_CONNECTION=pgsql

# Deploy
git push heroku main

# Run migrations
heroku run php artisan migrate --force
heroku run php artisan db:seed --class=CitySeeder --force
```

### DigitalOcean App Platform
```yaml
name: prayer-times-api
services:
- name: api
  source_dir: /
  github:
    repo: your-username/prayer-times-api
    branch: main
  run_command: |
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan migrate --force
    php artisan serve --host=0.0.0.0 --port=8080
  environment_slug: php
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  envs:
  - key: APP_ENV
    value: production
  - key: APP_KEY
    value: your-app-key
databases:
- name: prayer-times-db
  engine: PG
  version: "13"
```

## 🧪 Testing

### Unit Tests
```bash
php artisan test
```

### API Testing dengan cURL
```bash
# Health check
curl http://localhost:8000/api/health

# Get cities
curl http://localhost:8000/api/cities

# Prayer times
curl "http://localhost:8000/api/prayer-times?city=Banda Aceh"
```

## 📊 Performance

### Caching Strategy
- **Database queries** cached for 1 hour
- **Prayer times** cached per location/date
- **Cities data** cached for 1 hour
- **Redis** untuk production caching

### Database Optimization
```sql
-- Indexes untuk performa optimal
CREATE INDEX idx_cities_province_name ON cities(province, name);
CREATE INDEX idx_prayer_times_date_location ON prayer_times(date, latitude, longitude);
```

## 🔒 Security

### Best Practices
- ✅ Input validation dengan Form Requests
- ✅ SQL injection protection dengan Eloquent
- ✅ Rate limiting per IP
- ✅ CORS configuration
- ✅ Environment variables untuk secrets
- ✅ HTTPS enforcement di production

### Rate Limiting
```php
// Middleware otomatis applied
'throttle:api' => 60 requests per minute
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:8000/api/health/info
```

### Logs
```bash
tail -f storage/logs/laravel.log
```

### Performance Monitoring
- Laravel Telescope (development)
- New Relic / Datadog (production)
- Custom health endpoints

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### Code Standards
```bash
# PHP CS Fixer
./vendor/bin/pint

# PHPStan
./vendor/bin/phpstan analyse

# Tests
php artisan test
```

## 📄 License

MIT License - lihat file [LICENSE](../LICENSE) untuk detail.

## 🙏 Acknowledgments

- Laravel Framework
- Islamic prayer time algorithms
- Indonesian cities database
- Open source community

---

**Dibuat dengan ❤️ untuk umat Muslim Indonesia**

*API ini menggunakan perhitungan waktu shalat sesuai metode yang diakui secara internasional.*