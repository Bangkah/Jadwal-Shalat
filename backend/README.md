# Prayer Times API - Golang Backend

Backend API untuk aplikasi jadwal shalat yang ditulis dalam Golang.

## 🚀 Quick Start

### Prerequisites
- Go 1.21 atau lebih baru
- PostgreSQL database (Supabase sudah tersedia)

### Installation

1. Clone atau copy folder backend ini

2. Install dependencies:
```bash
go mod download
```

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan connection string database Anda:
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8080
```

4. Run the server:
```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## 📡 API Endpoints

### 1. GET /api/prayer-times
Mendapatkan jadwal shalat untuk lokasi tertentu.

**Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `date` (optional): Tanggal (YYYY-MM-DD)
- `city` (optional): Nama kota

**Example:**
```bash
curl "http://localhost:8080/api/prayer-times?latitude=-6.2088&longitude=106.8456"
```

### 2. GET /api/prayer-times/current
Mendapatkan info shalat saat ini dan berikutnya.

**Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude

**Example:**
```bash
curl "http://localhost:8080/api/prayer-times/current?latitude=-6.2088&longitude=106.8456"
```

### 3. GET /api/health
Health check endpoint.

**Example:**
```bash
curl "http://localhost:8080/api/health"
```

## 🏗️ Project Structure

```
backend/
├── main.go           # Main application file
├── go.mod            # Go module dependencies
├── Dockerfile        # Docker configuration
├── .env.example      # Environment variables template
└── README.md         # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| PORT | Server port | No | 8080 |

### Database

Aplikasi ini menggunakan tabel `prayer_times_cache` yang sudah dibuat melalui migrasi Supabase.

Schema:
```sql
CREATE TABLE prayer_times_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t prayer-times-api .
```

### Run Container
```bash
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:port/db" \
  prayer-times-api
```

## ☁️ Cloud Deployment

### Deploy ke Google Cloud Run

1. Build dan push image:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/prayer-times-api
```

2. Deploy:
```bash
gcloud run deploy prayer-times-api \
  --image gcr.io/YOUR_PROJECT_ID/prayer-times-api \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your_database_url"
```

### Deploy ke Heroku

1. Create Heroku app:
```bash
heroku create your-app-name
```

2. Set buildpack:
```bash
heroku buildpacks:set heroku/go
```

3. Set environment variables:
```bash
heroku config:set DATABASE_URL="your_database_url"
```

4. Deploy:
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

### Deploy ke VPS

1. Build binary:
```bash
GOOS=linux GOARCH=amd64 go build -o prayer-times-api main.go
```

2. Copy binary ke VPS Anda

3. Create systemd service `/etc/systemd/system/prayer-times-api.service`:
```ini
[Unit]
Description=Prayer Times API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/prayer-times-api
Environment="DATABASE_URL=your_database_url"
Environment="PORT=8080"
ExecStart=/opt/prayer-times-api/prayer-times-api
Restart=always

[Install]
WantedBy=multi-user.target
```

4. Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable prayer-times-api
sudo systemctl start prayer-times-api
```

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```

### Test Prayer Times
```bash
# Jakarta
curl "http://localhost:8080/api/prayer-times?latitude=-6.2088&longitude=106.8456&city=Jakarta"

# Surabaya
curl "http://localhost:8080/api/prayer-times?latitude=-7.2575&longitude=112.7521&city=Surabaya"

# Bandung
curl "http://localhost:8080/api/prayer-times?latitude=-6.9175&longitude=107.6191&city=Bandung"
```

## 📊 Performance

- Caching: Results di-cache selama 7 hari di database
- CORS: Sudah ter-konfigurasi untuk akses dari domain manapun
- Database connection pooling: Otomatis menggunakan database/sql

## 🔒 Security

- CORS enabled untuk public API access
- No authentication required (public API)
- SQL injection protected dengan parameterized queries
- Input validation pada semua endpoints

## 📝 Dependencies

```go
github.com/gorilla/mux v1.8.1      // HTTP router
github.com/lib/pq v1.10.9          // PostgreSQL driver
github.com/rs/cors v1.10.1         // CORS middleware
github.com/hablullah/go-prayer v1.0.1  // Prayer times calculation
```

## 🐛 Troubleshooting

### Database Connection Error
Pastikan `DATABASE_URL` sudah benar dan database dapat diakses:
```bash
# Test connection dengan psql
psql "your_database_url"
```

### Port Already in Use
Ubah PORT di environment variable:
```bash
export PORT=8081
go run main.go
```

### CORS Issues
CORS sudah ter-konfigurasi dengan:
- AllowedOrigins: "*"
- AllowedMethods: "GET", "POST", "OPTIONS"
- AllowedHeaders: "Content-Type", "Authorization"

## 📚 Additional Resources

- [Go Documentation](https://golang.org/doc/)
- [Gorilla Mux](https://github.com/gorilla/mux)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prayer Times Calculation](https://en.wikipedia.org/wiki/Salah_times)

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License
