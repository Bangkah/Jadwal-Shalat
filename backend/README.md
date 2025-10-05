# Prayer Times API - Enhanced Golang Backend

Backend API untuk aplikasi jadwal shalat yang ditulis dalam Golang dengan fitur-fitur canggih.

## 🚀 Fitur Baru

### ✨ Peningkatan Utama
- **Perhitungan Akurat**: Menggunakan library `go-prayer` untuk perhitungan waktu shalat yang presisi
- **Timezone Indonesia**: Otomatis mendeteksi WIB/WITA/WIT berdasarkan longitude
- **Database Caching**: Sistem cache yang efisien dengan PostgreSQL
- **Rate Limiting**: Perlindungan dari spam request
- **Health Check**: Monitoring kesehatan API dan database
- **Logging**: Request logging untuk debugging
- **CORS**: Konfigurasi CORS yang aman

### 🏙️ Data Kota Indonesia
- 30+ kota besar Indonesia dengan koordinat akurat
- Pencarian kota yang fleksibel (case-insensitive)
- Endpoint `/api/cities` untuk mendapatkan daftar kota

### 📊 API Endpoints

#### 1. GET `/api/prayer-times`
Mendapatkan jadwal shalat untuk lokasi dan tanggal tertentu.

**Parameters:**
- `latitude` (optional): Latitude lokasi
- `longitude` (optional): Longitude lokasi  
- `city` (optional): Nama kota
- `date` (optional): Tanggal (YYYY-MM-DD)

**Example:**
```bash
curl "http://localhost:8080/api/prayer-times?city=Jakarta"
curl "http://localhost:8080/api/prayer-times?latitude=-6.2088&longitude=106.8456"
```

#### 2. GET `/api/prayer-times/current`
Mendapatkan info shalat saat ini dan berikutnya.

**Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude

**Example:**
```bash
curl "http://localhost:8080/api/prayer-times/current?latitude=-6.2088&longitude=106.8456"
```

#### 3. GET `/api/cities`
Mendapatkan daftar kota Indonesia yang tersedia.

**Example:**
```bash
curl "http://localhost:8080/api/cities"
```

#### 4. GET `/api/health`
Health check endpoint dengan info database dan versi.

**Example:**
```bash
curl "http://localhost:8080/api/health"
```

## 🛠️ Installation & Setup

### Prerequisites
- Go 1.21 atau lebih baru
- PostgreSQL database

### Local Development

1. **Clone dan setup:**
```bash
cd backend
go mod download
```

2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env dengan database connection string Anda
```

3. **Run server:**
```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

### 🐳 Docker Deployment

#### Build dan Run
```bash
docker build -t prayer-times-api .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:port/db" \
  prayer-times-api
```

#### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/prayer_times
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=prayer_times
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## ☁️ Cloud Deployment

### Google Cloud Run
```bash
# Build dan push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/prayer-times-api

# Deploy
gcloud run deploy prayer-times-api \
  --image gcr.io/YOUR_PROJECT_ID/prayer-times-api \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your_database_url"
```

### Heroku
```bash
# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/go

# Set environment
heroku config:set DATABASE_URL="your_database_url"

# Deploy
git push heroku main
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login dan deploy
railway login
railway init
railway up
```

## 🗄️ Database Schema

```sql
CREATE TABLE prayer_times_cache (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  fajr TIME NOT NULL,
  sunrise TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, latitude, longitude)
);

CREATE INDEX idx_prayer_cache_date_location 
ON prayer_times_cache(date, latitude, longitude);
```

## 🧪 Testing

### Manual Testing
```bash
# Test health
curl http://localhost:8080/api/health

# Test cities
curl http://localhost:8080/api/cities

# Test prayer times
curl "http://localhost:8080/api/prayer-times?city=Jakarta"
curl "http://localhost:8080/api/prayer-times/current?latitude=-6.2088&longitude=106.8456"
```

### Load Testing dengan Apache Bench
```bash
# Test 1000 requests dengan 10 concurrent
ab -n 1000 -c 10 http://localhost:8080/api/health
```

## 📈 Performance & Monitoring

### Metrics
- Request logging dengan duration
- Database connection pooling
- Cache hit/miss tracking
- Health check endpoint

### Optimization
- Connection pooling (max 25 connections)
- Query optimization dengan indexes
- 7-day cache TTL
- Efficient coordinate matching

## 🔒 Security

### Features
- CORS protection
- Rate limiting middleware
- SQL injection protection
- Input validation
- No sensitive data exposure

### Best Practices
- Environment variables untuk secrets
- Non-root Docker user
- Health checks
- Graceful error handling

## 🌍 Timezone Support

API otomatis mendeteksi timezone Indonesia:
- **WIB** (UTC+7): Longitude < 105°
- **WITA** (UTC+8): Longitude 105° - 120°
- **WIT** (UTC+9): Longitude > 120°

## 📚 Dependencies

```go
github.com/gorilla/mux v1.8.1          // HTTP router
github.com/lib/pq v1.10.9              // PostgreSQL driver  
github.com/rs/cors v1.10.1             // CORS middleware
github.com/hablullah/go-prayer v1.1.1  // Prayer times calculation
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
```bash
# Test connection
psql "your_database_url"
```

2. **Port Already in Use**
```bash
export PORT=8081
go run main.go
```

3. **Permission Denied (Docker)**
```bash
# Check user permissions
docker run --rm -it prayer-times-api whoami
```

## 📄 API Response Examples

### Prayer Times Response
```json
{
  "date": "2025-01-04",
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

### Current Prayer Response
```json
{
  "current_prayer": "Dhuhr",
  "next_prayer": "Asr", 
  "time_until_next": "3 jam 15 menit",
  "prayer_times": {
    "date": "2025-01-04",
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

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.