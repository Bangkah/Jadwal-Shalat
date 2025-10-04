package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type PrayerTimes struct {
	Date      string  `json:"date"`
	Fajr      string  `json:"fajr"`
	Sunrise   string  `json:"sunrise"`
	Dhuhr     string  `json:"dhuhr"`
	Asr       string  `json:"asr"`
	Maghrib   string  `json:"maghrib"`
	Isha      string  `json:"isha"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      string  `json:"city,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var db *sql.DB

func main() {
	// Initialize database connection (optional)
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		db, err = sql.Open("mysql", dbURL)
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		// Try ping, but don't fatal if it fails — server can run without DB
		if err = db.Ping(); err != nil {
			log.Printf("Warning: failed to ping database: %v", err)
			// keep running without DB
			db = nil
		} else {
			log.Println("Successfully connected to database")
		}
	} else {
		log.Println("DATABASE_URL not set — running without DB (cache disabled)")
	}

	// Setup routes
	r := mux.NewRouter()
	r.HandleFunc("/api/prayer-times", getPrayerTimesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/prayer-times/current", getCurrentPrayerHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/health", healthCheckHandler).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "healthy",
		"time":   time.Now().Format(time.RFC3339),
	})
}

// ----------------- City / Coordinates -----------------
var indonesiaCities = map[string][3]interface{}{
	"jakarta":     {-6.2088, 106.8456, "Jakarta"},
	"bandung":     {-6.9175, 107.6191, "Bandung"},
	"surabaya":    {-7.2504, 112.7688, "Surabaya"},
	"medan":       {3.5952, 98.6722, "Medan"},
	"banda aceh":  {5.5483, 95.3238, "Banda Aceh"},
	"lhokseumawe": {5.1870, 97.1413, "Lhokseumawe"},
	"meulaboh":    {4.1421, 96.1283, "Meulaboh"},
	"langsa":      {4.4681, 97.9636, "Langsa"},
	"sigli":       {4.4483, 96.8846, "Sigli"},
	"subulussalam":{4.2164, 98.0011, "Subulussalam"},
	"bireuen":     {4.6951, 96.7494, "Bireuen"},
	"pidie":       {4.4488, 96.8846, "Pidie"},
	"aceh tamiang":{4.0106, 97.7998, "Aceh Tamiang"},
	"yogyakarta":  {-7.8014, 110.3647, "Yogyakarta"},
	"makassar":    {-5.1477, 119.4327, "Makassar"},
	"denpasar":    {-8.65, 115.2167, "Denpasar"},
	"palembang":   {-2.9909, 104.7566, "Palembang"},
	"semarang":    {-6.9667, 110.4167, "Semarang"},
	"balikpapan":  {-1.2654, 116.8312, "Balikpapan"},
	"jayapura":    {-2.5337, 140.7181, "Jayapura"},
	"pontianak":   {0.0263, 109.3425, "Pontianak"},
	// ...tambahkan kota lain sesuai kebutuhan...
}

func getAvailableCities(keyword string) []string {
	keywordLower := strings.ToLower(keyword)
	var result []string
	for k, v := range indonesiaCities {
		if keywordLower == "" || strings.Contains(k, keywordLower) || strings.Contains(strings.ToLower(v[2].(string)), keywordLower) {
			result = append(result, v[2].(string))
		}
	}
	return result
}

func getCoordinatesByCity(city string) (float64, float64, error) {
	cityLower := strings.ToLower(city)
	for k, v := range indonesiaCities {
		if strings.Contains(k, cityLower) || strings.Contains(cityLower, k) || strings.Contains(strings.ToLower(v[2].(string)), cityLower) {
			return v[0].(float64), v[1].(float64), nil
		}
	}
	return 0, 0, fmt.Errorf("city not found")
}

// ----------------- Handlers -----------------

// GET /api/prayer-times?city=Jakarta&date=2025-10-05
func getPrayerTimesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	city := r.URL.Query().Get("city")
	dateStr := r.URL.Query().Get("date")

	var lat, lon float64
	var err error
	var cityName string
	var date time.Time

	if city != "" {
		lat, lon, err = getCoordinatesByCity(city)
		if err != nil {
			respondWithError(w, "city not found", http.StatusBadRequest)
			return
		}
		cityName = indonesiaCities[strings.ToLower(city)][2].(string)
	} else {
		lat, lon, _ = getCoordinatesByCity("lhokseumawe")
		cityName = "Lhokseumawe"
	}

	if dateStr == "" {
		date = time.Now()
	} else {
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			respondWithError(w, "invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	}

	// try cache from DB
	if db != nil {
		if pt, err := getCachedPrayerTimes(lat, lon, date); err == nil {
			pt.City = cityName
			json.NewEncoder(w).Encode(pt)
			return
		}
	}

	pt := calculatePrayerTimes(lat, lon, date)
	pt.Date = date.Format("2006-01-02")
	pt.City = cityName

	// save cache (optional)
	if db != nil {
		_ = cachePrayerTimes(pt) // non-fatal
	}

	json.NewEncoder(w).Encode(pt)
}

// GET /api/prayer-times/current?latitude=...&longitude=...
func getCurrentPrayerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	latStr := r.URL.Query().Get("latitude")
	lonStr := r.URL.Query().Get("longitude")

	if latStr == "" || lonStr == "" {
		respondWithError(w, "latitude and longitude are required", http.StatusBadRequest)
		return
	}

	latitude, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		respondWithError(w, "invalid latitude", http.StatusBadRequest)
		return
	}

	longitude, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		respondWithError(w, "invalid longitude", http.StatusBadRequest)
		return
	}

	now := time.Now()
	pt := calculatePrayerTimes(latitude, longitude, now)
	pt.Date = now.Format("2006-01-02")

	json.NewEncoder(w).Encode(pt)
}

// ----------------- Simple Prayer Calculation (stub) -----------------
// Fungsi ini adalah placeholder sederhana. Ganti dengan algoritma nyata atau
// panggilan ke paket seperti github.com/hablullah/go-prayer untuk hasil akurat.
func calculatePrayerTimes(lat, lon float64, date time.Time) PrayerTimes {
	// contoh sederhana: base times + penyesuaian kecil berdasarkan lintang
	// HANYA untuk tujuan demo / testing server (bukan perhitungan agama yang akurat)
	year, month, day := date.Date()
	_ = year
	_ = month
	_ = day

	// buat variasi ringan berdasarkan lintang
	latFactor := math.Abs(lat) / 90.0

	// base times (24h)
	fajr := time.Date(date.Year(), date.Month(), date.Day(), 4, 45, 0, 0, time.Local)
	sunrise := time.Date(date.Year(), date.Month(), date.Day(), 6, 0, 0, 0, time.Local)
	dhuhr := time.Date(date.Year(), date.Month(), date.Day(), 12, 0, 0, 0, time.Local)
	asr := time.Date(date.Year(), date.Month(), date.Day(), 15, 15, 0, 0, time.Local)
	maghrib := time.Date(date.Year(), date.Month(), date.Day(), 18, 0, 0, 0, time.Local)
	isha := time.Date(date.Year(), date.Month(), date.Day(), 19, 15, 0, 0, time.Local)

	// sesuaikan sedikit berdasarkan latitude
	shiftMinutes := int(latFactor * 30) // sampai ~30 menit penyesuaian
	fajr = fajr.Add(time.Duration(-shiftMinutes) * time.Minute)
	isha = isha.Add(time.Duration(shiftMinutes) * time.Minute)
	asr = asr.Add(time.Duration(shiftMinutes/2) * time.Minute)

	return PrayerTimes{
		Fajr:      fajr.Format("15:04"),
		Sunrise:   sunrise.Format("15:04"),
		Dhuhr:     dhuhr.Format("15:04"),
		Asr:       asr.Format("15:04"),
		Maghrib:   maghrib.Format("15:04"),
		Isha:      isha.Format("15:04"),
		Latitude:  lat,
		Longitude: lon,
		Date:      date.Format("2006-01-02"),
	}
}

// ----------------- Cache (MySQL) -----------------
// Tabel contoh (MySQL):
// CREATE TABLE prayer_times_cache (
//   date DATE,
//   fajr VARCHAR(10),
//   sunrise VARCHAR(10),
//   dhuhr VARCHAR(10),
//   asr VARCHAR(10),
//   maghrib VARCHAR(10),
//   isha VARCHAR(10),
//   latitude DOUBLE,
//   longitude DOUBLE,
//   created_at DATETIME,
//   PRIMARY KEY (date, latitude, longitude)
// );

func getCachedPrayerTimes(latitude, longitude float64, date time.Time) (*PrayerTimes, error) {
	if db == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	query := `
		SELECT date, fajr, sunrise, dhuhr, asr, maghrib, isha, latitude, longitude
		FROM prayer_times_cache
		WHERE latitude = ? AND longitude = ? AND date = ?
		AND created_at > (NOW() - INTERVAL 7 DAY)
		LIMIT 1
	`

	var pt PrayerTimes
	err := db.QueryRow(query, latitude, longitude, date.Format("2006-01-02")).Scan(
		&pt.Date, &pt.Fajr, &pt.Sunrise, &pt.Dhuhr, &pt.Asr, &pt.Maghrib, &pt.Isha,
		&pt.Latitude, &pt.Longitude,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, err
	}

	return &pt, nil
}

func cachePrayerTimes(pt PrayerTimes) error {
	if db == nil {
		return fmt.Errorf("database not initialized")
	}

	query := `
		INSERT INTO prayer_times_cache (date, fajr, sunrise, dhuhr, asr, maghrib, isha, latitude, longitude, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
		ON DUPLICATE KEY UPDATE
			fajr = VALUES(fajr), sunrise = VALUES(sunrise),
			dhuhr = VALUES(dhuhr), asr = VALUES(asr),
			maghrib = VALUES(maghrib), isha = VALUES(isha),
			created_at = NOW()
	`

	_, err := db.Exec(query, pt.Date, pt.Fajr, pt.Sunrise, pt.Dhuhr, pt.Asr, pt.Maghrib, pt.Isha, pt.Latitude, pt.Longitude)
	return err
}

// ----------------- Helpers -----------------
func respondWithError(w http.ResponseWriter, message string, code int) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}
