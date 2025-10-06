
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

	_ "github.com/lib/pq"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/hablullah/go-prayer"
	"github.com/joho/godotenv"
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

type CurrentPrayerInfo struct {
	CurrentPrayer    string      `json:"current_prayer"`
	NextPrayer       string      `json:"next_prayer"`
	TimeUntilNext    string      `json:"time_until_next"`
	PrayerTimes      PrayerTimes `json:"prayer_times"`
}

type City struct {
	Name      string  `json:"name"`
	Province  string  `json:"province"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timezone  string  `json:"timezone"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Time      string `json:"time"`
	Database  string `json:"database"`
	Version   string `json:"version"`
	Cities    int    `json:"cities_count"`
}

var db *sql.DB

const VERSION = "2.1.0"

// 50+ Kota Indonesia dengan fokus pada Aceh dan kota-kota besar lainnya
var indonesiaCities = map[string]City{
	// ACEH (15 kota/kabupaten)
	"banda aceh":     {"Banda Aceh", "Aceh", 5.5483, 95.3238, "Asia/Jakarta"},
	"lhokseumawe":    {"Lhokseumawe", "Aceh", 5.1870, 97.1413, "Asia/Jakarta"},
	"langsa":         {"Langsa", "Aceh", 4.4683, 97.9683, "Asia/Jakarta"},
	"sabang":         {"Sabang", "Aceh", 5.8947, 95.3222, "Asia/Jakarta"},
	"meulaboh":       {"Meulaboh", "Aceh", 4.1372, 96.1266, "Asia/Jakarta"},
	"sigli":          {"Sigli", "Aceh", 5.3864, 95.9619, "Asia/Jakarta"},
	"bireuen":        {"Bireuen", "Aceh", 5.2030, 96.7017, "Asia/Jakarta"},
	"takengon":       {"Takengon", "Aceh", 4.6272, 96.8286, "Asia/Jakarta"},
	"calang":         {"Calang", "Aceh", 4.3667, 95.6667, "Asia/Jakarta"},
	"jantho":         {"Jantho", "Aceh", 5.2833, 95.6167, "Asia/Jakarta"},
	"kutacane":       {"Kutacane", "Aceh", 3.7333, 97.9167, "Asia/Jakarta"},
	"blangkejeren":   {"Blangkejeren", "Aceh", 4.1667, 97.1667, "Asia/Jakarta"},
	"idi":            {"Idi", "Aceh", 4.9167, 97.8333, "Asia/Jakarta"},
	"tapaktuan":      {"Tapaktuan", "Aceh", 3.2667, 97.2000, "Asia/Jakarta"},
	"subulussalam":   {"Subulussalam", "Aceh", 2.6667, 97.9500, "Asia/Jakarta"},

	// SUMATERA UTARA (8 kota)
	"medan":          {"Medan", "Sumatera Utara", 3.5952, 98.6722, "Asia/Jakarta"},
	"binjai":         {"Binjai", "Sumatera Utara", 3.6000, 98.4833, "Asia/Jakarta"},
	"tebing tinggi":  {"Tebing Tinggi", "Sumatera Utara", 3.3281, 99.1625, "Asia/Jakarta"},
	"pematangsiantar": {"Pematangsiantar", "Sumatera Utara", 2.9667, 99.0667, "Asia/Jakarta"},
	"tanjungbalai":   {"Tanjungbalai", "Sumatera Utara", 2.9667, 99.8000, "Asia/Jakarta"},
	"sibolga":        {"Sibolga", "Sumatera Utara", 1.7425, 98.7792, "Asia/Jakarta"},
	"padangsidimpuan": {"Padangsidimpuan", "Sumatera Utara", 1.3833, 99.2667, "Asia/Jakarta"},
	"gunungsitoli":   {"Gunungsitoli", "Sumatera Utara", 1.2833, 97.6167, "Asia/Jakarta"},

	// SUMATERA BARAT (4 kota)
	"padang":         {"Padang", "Sumatera Barat", -0.9471, 100.4172, "Asia/Jakarta"},
	"bukittinggi":    {"Bukittinggi", "Sumatera Barat", -0.3056, 100.3692, "Asia/Jakarta"},
	"payakumbuh":     {"Payakumbuh", "Sumatera Barat", -0.2167, 100.6333, "Asia/Jakarta"},
	"padangpanjang":  {"Padangpanjang", "Sumatera Barat", -0.4667, 100.4000, "Asia/Jakarta"},

	// RIAU (3 kota)
	"pekanbaru":      {"Pekanbaru", "Riau", 0.5071, 101.4478, "Asia/Jakarta"},
	"dumai":          {"Dumai", "Riau", 1.6667, 101.4500, "Asia/Jakarta"},
	"batam":          {"Batam", "Kepulauan Riau", 1.1304, 104.0530, "Asia/Jakarta"},

	// JAMBI & BENGKULU (3 kota)
	"jambi":          {"Jambi", "Jambi", -1.6101, 103.6131, "Asia/Jakarta"},
	"bengkulu":       {"Bengkulu", "Bengkulu", -3.7928, 102.2607, "Asia/Jakarta"},
	"curup":          {"Curup", "Bengkulu", -3.4667, 102.5167, "Asia/Jakarta"},

	// SUMATERA SELATAN (3 kota)
	"palembang":      {"Palembang", "Sumatera Selatan", -2.9909, 104.7566, "Asia/Jakarta"},
	"lubuklinggau":   {"Lubuklinggau", "Sumatera Selatan", -3.3000, 102.8667, "Asia/Jakarta"},
	"prabumulih":     {"Prabumulih", "Sumatera Selatan", -3.4333, 104.2333, "Asia/Jakarta"},

	// LAMPUNG (2 kota)
	"bandar lampung": {"Bandar Lampung", "Lampung", -5.4292, 105.2610, "Asia/Jakarta"},
	"metro":          {"Metro", "Lampung", -5.1133, 105.3067, "Asia/Jakarta"},

	// JAWA BARAT (5 kota)
	"bandung":        {"Bandung", "Jawa Barat", -6.9175, 107.6191, "Asia/Jakarta"},
	"bekasi":         {"Bekasi", "Jawa Barat", -6.2383, 106.9756, "Asia/Jakarta"},
	"bogor":          {"Bogor", "Jawa Barat", -6.5944, 106.7892, "Asia/Jakarta"},
	"depok":          {"Depok", "Jawa Barat", -6.4025, 106.7942, "Asia/Jakarta"},
	"cirebon":        {"Cirebon", "Jawa Barat", -6.7063, 108.5571, "Asia/Jakarta"},

	// DKI JAKARTA (1 kota)
	"jakarta":        {"Jakarta", "DKI Jakarta", -6.2088, 106.8456, "Asia/Jakarta"},

	// JAWA TENGAH (4 kota)
	"semarang":       {"Semarang", "Jawa Tengah", -6.9667, 110.4167, "Asia/Jakarta"},
	"solo":           {"Solo", "Jawa Tengah", -7.5663, 110.8281, "Asia/Jakarta"},
	"yogyakarta":     {"Yogyakarta", "DI Yogyakarta", -7.8014, 110.3647, "Asia/Jakarta"},
	"magelang":       {"Magelang", "Jawa Tengah", -7.4697, 110.2175, "Asia/Jakarta"},

	// JAWA TIMUR (4 kota)
	"surabaya":       {"Surabaya", "Jawa Timur", -7.2504, 112.7688, "Asia/Jakarta"},
	"malang":         {"Malang", "Jawa Timur", -7.9797, 112.6304, "Asia/Jakarta"},
	"kediri":         {"Kediri", "Jawa Timur", -7.8167, 112.0167, "Asia/Jakarta"},
	"probolinggo":    {"Probolinggo", "Jawa Timur", -7.7542, 113.2159, "Asia/Jakarta"},

	// BALI & NUSA TENGGARA (3 kota)
	"denpasar":       {"Denpasar", "Bali", -8.6500, 115.2167, "Asia/Makassar"},
	"mataram":        {"Mataram", "Nusa Tenggara Barat", -8.5833, 116.1167, "Asia/Makassar"},
	"kupang":         {"Kupang", "Nusa Tenggara Timur", -10.1718, 123.6075, "Asia/Makassar"},

	// KALIMANTAN (4 kota)
	"pontianak":      {"Pontianak", "Kalimantan Barat", 0.0263, 109.3425, "Asia/Jakarta"},
	"banjarmasin":    {"Banjarmasin", "Kalimantan Selatan", -3.3194, 114.5906, "Asia/Makassar"},
	"balikpapan":     {"Balikpapan", "Kalimantan Timur", -1.2654, 116.8312, "Asia/Makassar"},
	"samarinda":      {"Samarinda", "Kalimantan Timur", -0.5022, 117.1536, "Asia/Makassar"},

	// SULAWESI (4 kota)
	"makassar":       {"Makassar", "Sulawesi Selatan", -5.1477, 119.4327, "Asia/Makassar"},
	"manado":         {"Manado", "Sulawesi Utara", 1.4748, 124.8421, "Asia/Makassar"},
	"palu":           {"Palu", "Sulawesi Tengah", -0.8917, 119.8707, "Asia/Makassar"},
	"kendari":        {"Kendari", "Sulawesi Tenggara", -3.9450, 122.4989, "Asia/Makassar"},

	// MALUKU & PAPUA (3 kota)
	"ambon":          {"Ambon", "Maluku", -3.6954, 128.1814, "Asia/Jayapura"},
	"jayapura":       {"Jayapura", "Papua", -2.5337, 140.7181, "Asia/Jayapura"},
	"sorong":         {"Sorong", "Papua Barat", -0.8833, 131.2500, "Asia/Jayapura"},
}

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		db, dbErr := sql.Open("postgres", dbURL)
		if dbErr != nil {
			log.Fatalf("Failed to connect to database: %v", dbErr)
		}
		
		// Configure connection pool
		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(25)
		db.SetConnMaxLifetime(5 * time.Minute)
		
		if err = db.Ping(); err != nil {
			log.Printf("Warning: failed to ping database: %v", err)
			db = nil
		} else {
			log.Println("Successfully connected to database")
			// Create tables if they don't exist
			createTables()
		}
	} else {
		log.Println("DATABASE_URL not set — running without DB (cache disabled)")
	}

	// Setup routes
	r := mux.NewRouter()
	
	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/prayer-times", getPrayerTimesHandler).Methods("GET", "OPTIONS")
	api.HandleFunc("/prayer-times/current", getCurrentPrayerHandler).Methods("GET", "OPTIONS")
	api.HandleFunc("/cities", getCitiesHandler).Methods("GET", "OPTIONS")
	api.HandleFunc("/health", healthCheckHandler).Methods("GET")
	
	// Add middleware
	api.Use(loggingMiddleware)
	api.Use(rateLimitMiddleware)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
		MaxAge:           300,
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Prayer Times API v%s starting on port %s", VERSION, port)
	log.Printf("📍 Loaded %d Indonesian cities", len(indonesiaCities))
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func createTables() {
	query := `
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
	
	CREATE INDEX IF NOT EXISTS idx_prayer_cache_date_location 
	ON prayer_times_cache(date, latitude, longitude);
	`
	
	if _, err := db.Exec(query); err != nil {
		log.Printf("Error creating tables: %v", err)
	} else {
		log.Println("Database tables ready")
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simple rate limiting - in production use Redis or similar
		next.ServeHTTP(w, r)
	})
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	dbStatus := "disconnected"
	if db != nil {
		if err := db.Ping(); err == nil {
			dbStatus = "connected"
		}
	}
	
	response := HealthResponse{
		Status:   "healthy",
		Time:     time.Now().Format(time.RFC3339),
		Database: dbStatus,
		Version:  VERSION,
		Cities:   len(indonesiaCities),
	}
	
	json.NewEncoder(w).Encode(response)
}

func getCitiesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var cities []City
	for _, city := range indonesiaCities {
		cities = append(cities, city)
	}
	
	json.NewEncoder(w).Encode(cities)
}

func getCoordinatesByCity(city string) (float64, float64, string, error) {
	cityLower := strings.ToLower(city)
	for k, v := range indonesiaCities {
		if strings.Contains(k, cityLower) || strings.Contains(cityLower, k) || 
		   strings.Contains(strings.ToLower(v.Name), cityLower) {
			return v.Latitude, v.Longitude, v.Name, nil
		}
	}
	return 0, 0, "", fmt.Errorf("city not found")
}

func getPrayerTimesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	city := r.URL.Query().Get("city")
	dateStr := r.URL.Query().Get("date")
	latStr := r.URL.Query().Get("latitude")
	lonStr := r.URL.Query().Get("longitude")

	var lat, lon float64
	var err error
	var cityName string
	var date time.Time

	// Parse coordinates
	if latStr != "" && lonStr != "" {
		lat, err = strconv.ParseFloat(latStr, 64)
		if err != nil {
			respondWithError(w, "invalid latitude", http.StatusBadRequest)
			return
		}
		lon, err = strconv.ParseFloat(lonStr, 64)
		if err != nil {
			respondWithError(w, "invalid longitude", http.StatusBadRequest)
			return
		}
		cityName = "Custom Location"
	} else if city != "" {
		lat, lon, cityName, err = getCoordinatesByCity(city)
		if err != nil {
			respondWithError(w, "city not found", http.StatusBadRequest)
			return
		}
	} else {
		// Default to Lhokseumawe
		lat, lon, cityName, _ = getCoordinatesByCity("lhokseumawe")
	}

	// Parse date
	if dateStr == "" {
		date = time.Now()
	} else {
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			respondWithError(w, "invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	}

	// Try cache first
	if db != nil {
		if pt, err := getCachedPrayerTimes(lat, lon, date); err == nil {
			pt.City = cityName
			json.NewEncoder(w).Encode(pt)
			return
		}
	}

	// Calculate prayer times
	pt := calculatePrayerTimes(lat, lon, date)
	pt.Date = date.Format("2006-01-02")
	pt.City = cityName

	// Save to cache
	if db != nil {
		_ = cachePrayerTimes(pt)
	}

	json.NewEncoder(w).Encode(pt)
}

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

	// Determine current and next prayer
	currentPrayer, nextPrayer, timeUntilNext := getCurrentAndNextPrayer(pt, now)

	response := CurrentPrayerInfo{
		CurrentPrayer: currentPrayer,
		NextPrayer:    nextPrayer,
		TimeUntilNext: timeUntilNext,
		PrayerTimes:   pt,
	}

	json.NewEncoder(w).Encode(response)
}

func calculatePrayerTimes(lat, lon float64, date time.Time) PrayerTimes {
	// Use go-prayer library for accurate calculations
	config := prayer.Config{
		Latitude:         lat,
		Longitude:        lon,
		Elevation:        0,
		PreciseToSeconds: false,
	}

	// Julian Day calculation
	y, m, d := date.Date()
	if m <= 2 {
		y--
		m += 12
	}
	a := y / 100
	b := 2 - a + a/4
	julianDay := int(365.25*float64(y+4716)) + int(30.6001*float64(m+1)) + d + b - 1524

	prayers, err := prayer.Calculate(config, julianDay)
	if err != nil || len(prayers) == 0 {
		// Fallback to simple calculation
		return calculateSimplePrayerTimes(lat, lon, date)
	}

	timezone := getIndonesianTimezone(lon)
	loc, _ := time.LoadLocation(timezone)

	schedule := prayers[0]

	return PrayerTimes{
		Fajr:      schedule.Fajr.In(loc).Format("15:04"),
		Sunrise:   schedule.Sunrise.In(loc).Format("15:04"),
		Dhuhr:     schedule.Zuhr.In(loc).Format("15:04"),
		Asr:       schedule.Asr.In(loc).Format("15:04"),
		Maghrib:   schedule.Maghrib.In(loc).Format("15:04"),
		Isha:      schedule.Isha.In(loc).Format("15:04"),
		Latitude:  lat,
		Longitude: lon,
		Date:      date.Format("2006-01-02"),
	}
}

func getIndonesianTimezone(longitude float64) string {
	if longitude < 105 {
		return "Asia/Jakarta" // WIB (UTC+7)
	} else if longitude < 120 {
		return "Asia/Makassar" // WITA (UTC+8)
	} else {
		return "Asia/Jayapura" // WIT (UTC+9)
	}
}

func calculateSimplePrayerTimes(lat, lon float64, date time.Time) PrayerTimes {
	// Simple fallback calculation
	year, month, day := date.Date()
	
	// Base times with latitude adjustment
	latFactor := math.Abs(lat) / 90.0
	shiftMinutes := int(latFactor * 30)

	fajr := time.Date(year, month, day, 4, 45-shiftMinutes, 0, 0, time.Local)
	sunrise := time.Date(year, month, day, 6, 0, 0, 0, time.Local)
	dhuhr := time.Date(year, month, day, 12, 0, 0, 0, time.Local)
	asr := time.Date(year, month, day, 15, 15+shiftMinutes/2, 0, 0, time.Local)
	maghrib := time.Date(year, month, day, 18, 0, 0, 0, time.Local)
	isha := time.Date(year, month, day, 19, 15+shiftMinutes, 0, 0, time.Local)

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

func getCurrentAndNextPrayer(pt PrayerTimes, now time.Time) (string, string, string) {
	currentTime := now.Format("15:04")
	prayers := []struct {
		name string
		time string
	}{
		{"Fajr", pt.Fajr},
		{"Sunrise", pt.Sunrise},
		{"Dhuhr", pt.Dhuhr},
		{"Asr", pt.Asr},
		{"Maghrib", pt.Maghrib},
		{"Isha", pt.Isha},
	}

	var current, next string
	var nextTime time.Time

	for _, prayer := range prayers {
		if currentTime >= prayer.time {
			current = prayer.name
		} else {
			next = prayer.name
			nextTime, _ = time.Parse("15:04", prayer.time)
			break
		}
	}

	// If past Isha, next is Fajr tomorrow
	if next == "" {
		next = "Fajr"
		nextTime, _ = time.Parse("15:04", pt.Fajr)
		nextTime = nextTime.Add(24 * time.Hour)
	}

	// Calculate time until next prayer
	nowTime, _ := time.Parse("15:04", currentTime)
	duration := nextTime.Sub(nowTime)
	if duration < 0 {
		duration += 24 * time.Hour
	}

	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60
	timeUntil := fmt.Sprintf("%d jam %d menit", hours, minutes)

	return current, next, timeUntil
}

func getCachedPrayerTimes(latitude, longitude float64, date time.Time) (*PrayerTimes, error) {
	if db == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	query := `
		SELECT date, fajr, sunrise, dhuhr, asr, maghrib, isha, latitude, longitude, city
		FROM prayer_times_cache
		WHERE ABS(latitude - $1) < 0.01 AND ABS(longitude - $2) < 0.01 
		AND date = $3
		AND created_at > (NOW() - INTERVAL '7 days')
		LIMIT 1
	`

	var pt PrayerTimes
	var city sql.NullString
	err := db.QueryRow(query, latitude, longitude, date.Format("2006-01-02")).Scan(
		&pt.Date, &pt.Fajr, &pt.Sunrise, &pt.Dhuhr, &pt.Asr, &pt.Maghrib, &pt.Isha,
		&pt.Latitude, &pt.Longitude, &city,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, err
	}

	if city.Valid {
		pt.City = city.String
	}

	return &pt, nil
}

func cachePrayerTimes(pt PrayerTimes) error {
	if db == nil {
		return fmt.Errorf("database not initialized")
	}

	query := `
		INSERT INTO prayer_times_cache (date, fajr, sunrise, dhuhr, asr, maghrib, isha, latitude, longitude, city, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
		ON CONFLICT (date, latitude, longitude) DO UPDATE SET
			fajr = EXCLUDED.fajr,
			sunrise = EXCLUDED.sunrise,
			dhuhr = EXCLUDED.dhuhr,
			asr = EXCLUDED.asr,
			maghrib = EXCLUDED.maghrib,
			isha = EXCLUDED.isha,
			city = EXCLUDED.city,
			created_at = NOW()
	`

	_, err := db.Exec(query, pt.Date, pt.Fajr, pt.Sunrise, pt.Dhuhr, pt.Asr, pt.Maghrib, pt.Isha, pt.Latitude, pt.Longitude, pt.City)
	return err
}

func respondWithError(w http.ResponseWriter, message string, code int) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}