# 🕌 Aplikasi Jadwal Shalat Indonesia v2.1.0

Aplikasi jadwal shalat modern dengan backend API Golang dan frontend React, mendukung **50+ kota Indonesia** termasuk seluruh daerah Aceh, pencarian lokasi otomatis/manual, serta data lengkap tanpa ketergantungan API eksternal.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Kota yang Didukung](#-kota-yang-didukung)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Screenshot](#-screenshot)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Database](#-konfigurasi-database)
- [Menjalankan Backend](#-menjalankan-backend)
- [Menjalankan Frontend](#-menjalankan-frontend)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Fitur Utama

### 🎯 **Fitur Inti**
- ✅ **Jadwal Shalat Akurat** - Perhitungan menggunakan metode Kementerian Agama Indonesia
- ✅ **50+ Kota Indonesia** - Data lengkap dari Sabang sampai Merauke, fokus Aceh
- ✅ **Deteksi Lokasi Otomatis** - GPS/Geolocation dengan fallback manual
- ✅ **Real-time Updates** - Auto-refresh setiap 5 menit
- ✅ **Current Prayer Info** - Info shalat saat ini dan countdown ke shalat berikutnya
- ✅ **Timezone Indonesia** - Otomatis WIB/WITA/WIT berdasarkan longitude
- ✅ **Responsive Design** - Optimal di desktop, tablet, dan mobile

### 🚀 **Fitur Teknis**
- ✅ **High Performance** - Database caching dengan PostgreSQL
- ✅ **API Monitoring** - Health check dan status monitoring
- ✅ **Error Handling** - Error handling yang comprehensive
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Production Ready** - Docker support dan deployment guides
- ✅ **Public API** - RESTful API yang bisa digunakan aplikasi lain

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
│   React + TS    │◄──►│   Golang API    │◄──►│  PostgreSQL     │
│   + Tailwind    │    │   + go-prayer   │    │  + Supabase     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Golang 1.21 + Gorilla Mux + go-prayer library
- **Database**: PostgreSQL (Supabase recommended)
- **Deployment**: Docker + Cloud platforms (Vercel, Railway, etc.)

## 📋 Prasyarat

Pastikan sistem Anda memiliki:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Go** 1.21+ ([Download](https://golang.org/dl/))
- **PostgreSQL** 13+ atau akun [Supabase](https://supabase.com) (Recommended)
- **Git** ([Download](https://git-scm.com/))

### Verifikasi Instalasi:
```bash
node --version    # v18.0.0+
go version       # go1.21.0+
psql --version   # PostgreSQL 13+
git --version    # git 2.30.0+
```

## 🚀 Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Bangkah/prayer-times-app.git
cd prayer-times-app
```

### 2. Setup Backend Dependencies
```bash
cd backend
go mod download
go mod tidy
```

### 3. Setup Frontend Dependencies
```bash
cd ../
npm install
```

## 🗄️ Konfigurasi Database

### Option A: Menggunakan Supabase (Recommended)

1. **Buat Akun Supabase**
   - Kunjungi [supabase.com](https://supabase.com)
   - Buat project baru
   - Catat `Project URL` dan `anon key`

2. **Setup Database Schema**
   
   Jalankan SQL berikut di Supabase SQL Editor:

   ```sql
   -- Tabel untuk cache waktu shalat
   CREATE TABLE IF NOT EXISTS prayer_times_cache (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

   -- Index untuk performa
   CREATE INDEX IF NOT EXISTS idx_prayer_cache_date_location 
   ON prayer_times_cache(date, latitude, longitude);

   -- Enable RLS
   ALTER TABLE prayer_times_cache ENABLE ROW LEVEL SECURITY;

   -- Policy untuk akses publik read
   CREATE POLICY "Anyone can read prayer times"
     ON prayer_times_cache
     FOR SELECT
     TO public
     USING (true);

   -- Policy untuk authenticated users
   CREATE POLICY "Authenticated users can insert prayer times"
     ON prayer_times_cache
     FOR INSERT
     TO authenticated
     WITH CHECK (true);

   CREATE POLICY "Authenticated users can update prayer times"
     ON prayer_times_cache
     FOR UPDATE
     TO authenticated
     USING (true)
     WITH CHECK (true);
   ```

3. **Konfigurasi Environment Variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   PORT=8080

   # Frontend (.env)
   VITE_SUPABASE_URL="https://[project-ref].supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   VITE_API_URL="http://localhost:8080"
   ```

### Option B: PostgreSQL Lokal

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql
   brew services start postgresql

   # Windows - Download dari postgresql.org
   ```

2. **Buat Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE prayer_times;
   CREATE USER prayer_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE prayer_times TO prayer_user;
   \q
   ```

3. **Setup Schema**
   ```bash
   psql -U prayer_user -d prayer_times -f backend/schema.sql
   ```

## 🔧 Menjalankan Backend

### Development Mode

1. **Setup Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env dengan database connection string Anda
   ```

2. **Jalankan Server**
   ```bash
   go run main.go
   ```

   Server akan berjalan di `http://localhost:8080`

3. **Test API**
   ```bash
   # Health check
   curl http://localhost:8080/api/health

   # Get cities
   curl http://localhost:8080/api/cities

   # Get prayer times
   curl "http://localhost:8080/api/prayer-times?city=Jakarta"
   ```

### Production Mode

1. **Build Binary**
   ```bash
   go build -o prayer-times-api main.go
   ```

2. **Run Binary**
   ```bash
   ./prayer-times-api
   ```

### Docker Mode

1. **Build Image**
   ```bash
   docker build -t prayer-times-api .
   ```

2. **Run Container**
   ```bash
   docker run -p 8080:8080 \
     -e DATABASE_URL="your_database_url" \
     prayer-times-api
   ```

## 🎨 Menjalankan Frontend

### Development Mode

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Supabase dan API URL
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

   Frontend akan berjalan di `http://localhost:5173`

### Production Build

1. **Build untuk Production**
   ```bash
   npm run build
   ```

2. **Preview Build**
   ```bash
   npm run preview
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
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
  "database": "connected",
  "version": "2.1.0",
  "cities_count": 53
}
```

#### 2. Get Cities
```http
GET /api/cities
```

**Response:**
```json
[
  {
    "name": "Banda Aceh",
    "province": "Aceh",
    "latitude": 5.5483,
    "longitude": 95.3238,
    "timezone": "Asia/Jakarta"
  },
  {
    "name": "Lhokseumawe",
    "province": "Aceh", 
    "latitude": 5.1870,
    "longitude": 97.1413,
    "timezone": "Asia/Jakarta"
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
  "fajr": "04:30",
  "sunrise": "05:45",
  "dhuhr": "12:00",
  "asr": "15:15",
  "maghrib": "18:00",
  "isha": "19:15",
  "latitude": 5.5483,
  "longitude": 95.3238,
  "city": "Banda Aceh"
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
    "isha": "19:15",
    "latitude": 5.5483,
    "longitude": 95.3238
  }
}
```

### Contoh Penggunaan API

#### JavaScript/TypeScript
```javascript
// Get prayer times for Banda Aceh
const response = await fetch('http://localhost:8080/api/prayer-times?city=Banda Aceh');
const data = await response.json();
console.log(data);

// Get current prayer info
const currentResponse = await fetch('http://localhost:8080/api/prayer-times/current?latitude=5.5483&longitude=95.3238');
const currentData = await currentResponse.json();
console.log(currentData);
```

#### Python
```python
import requests

# Get prayer times for Lhokseumawe
response = requests.get('http://localhost:8080/api/prayer-times', params={
    'city': 'Lhokseumawe'
})
data = response.json()
print(data)
```

#### cURL
```bash
# Get prayer times by city
curl "http://localhost:8080/api/prayer-times?city=Langsa"

# Get prayer times by coordinates
curl "http://localhost:8080/api/prayer-times?latitude=4.4683&longitude=97.9683"

# Get current prayer info
curl "http://localhost:8080/api/prayer-times/current?latitude=4.4683&longitude=97.9683"
```

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel dashboard
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_backend_url
```

#### Netlify
```bash
# Build
npm run build

# Deploy dist folder ke Netlify
# Set environment variables di Netlify dashboard
```

### Backend Deployment

#### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login dan deploy
railway login
railway init
railway up

# Set environment variables
railway variables set DATABASE_URL="your_database_url"
```

#### Google Cloud Run
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

#### Heroku
```bash
# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/go

# Set environment variables
heroku config:set DATABASE_URL="your_database_url"

# Deploy
git subtree push --prefix backend heroku main
```

#### VPS dengan Docker
```bash
# Di server VPS
git clone https://github.com/username/prayer-times-app.git
cd prayer-times-app/backend

# Build dan run
docker build -t prayer-times-api .
docker run -d -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  --name prayer-api \
  prayer-times-api
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/prayer_times

# Server Configuration  
PORT=8080

# Optional: Enable debug mode
DEBUG=false

# Optional: Set timezone
TZ=Asia/Jakarta
```

### Frontend (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API URL
VITE_API_URL=http://localhost:8080

# Optional: Enable development mode
VITE_DEV_MODE=true
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Test connection
psql "your_database_url"

# Check if database exists
\l

# Check if tables exist
\dt
```

**Solution:**
- Pastikan DATABASE_URL benar
- Pastikan database server berjalan
- Pastikan tabel sudah dibuat

#### 2. CORS Error
```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Pastikan backend berjalan di port 8080
- Check CORS configuration di backend
- Pastikan VITE_API_URL benar

#### 3. Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 PID

# Or use different port
export PORT=8081
```

#### 4. Permission Denied (Docker)
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker run ...
```

#### 5. Go Module Issues
```bash
# Clean module cache
go clean -modcache

# Re-download dependencies
go mod download
go mod tidy
```

#### 6. Node Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Backend Debug
```bash
# Enable debug logging
export DEBUG=true
go run main.go
```

#### Frontend Debug
```bash
# Enable development mode
export VITE_DEV_MODE=true
npm run dev
```

### Performance Issues

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_cache_date_location 
ON prayer_times_cache(date, latitude, longitude);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM prayer_times_cache WHERE date = '2024-01-04';
```

#### Backend Optimization
```go
// Increase connection pool
db.SetMaxOpenConns(50)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)
```

## 🤝 Contributing

Kami menyambut kontribusi dari komunitas! Berikut cara berkontribusi:

### 1. Fork Repository
```bash
git clone https://github.com/your-username/prayer-times-app.git
cd prayer-times-app
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
- **Go**: Gunakan `gofmt` dan `golint`
- **TypeScript**: Gunakan Prettier dan ESLint
- **Commits**: Gunakan conventional commits

#### Testing
```bash
# Backend tests
cd backend
go test ./...

# Frontend tests  
npm test
```

#### Documentation
- Update README jika menambah fitur
- Tambahkan comments untuk code yang complex
- Update API documentation

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
Copyright (c) 2024 Prayer Times App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- [go-prayer](https://github.com/hablullah/go-prayer) - Library perhitungan waktu shalat
- [Supabase](https://supabase.com) - Database dan backend services
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide React](https://lucide.dev) - Icon library
- Komunitas open source yang telah berkontribusi

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. **Check Documentation** - Baca README ini dengan teliti
2. **Search Issues** - Cek [GitHub Issues](https://github.com/username/prayer-times-app/issues)
3. **Create Issue** - Buat issue baru dengan detail yang lengkap
4. **Join Discussion** - Bergabung di [GitHub Discussions](https://github.com/username/prayer-times-app/discussions)

---

**Dibuat dengan ❤️ untuk umat Muslim Indonesia**

*Semoga aplikasi ini bermanfaat untuk membantu ibadah shalat kita semua. Aamiin.* 🤲

## 🆕 Changelog v2.1.0

### ✨ New Features
- ➕ **50+ Kota Indonesia** - Tambahan 20+ kota baru termasuk seluruh Aceh
- 🔄 **Enhanced Location Selector** - UI yang lebih baik dengan grouping by province
- 📊 **Improved API Status** - Monitoring yang lebih detail dengan cities count
- 🎯 **Better Error Handling** - Error messages yang lebih informatif
- ⚡ **Performance Improvements** - Timeout yang lebih optimal (15 detik)

### 🐛 Bug Fixes
- 🔧 Fixed geolocation timeout issues
- 🔧 Improved city search functionality
- 🔧 Better error recovery mechanisms
- 🔧 Enhanced responsive design

### 🏗️ Technical Improvements
- 📦 Updated dependencies to latest versions
- 🔒 Enhanced security configurations
- 📝 Comprehensive documentation updates
- 🧪 Better type safety throughout the app