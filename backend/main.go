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

type ErrorResponse struct {
	Error string `json:"error"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Time      string `json:"time"`
	Database  string `json:"database"`
	Version   string `json:"version"`
}

var db *sql.DB

const VERSION = "2.0.0"

func main() {
	// Initialize database connection
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		db, err = sql.Open("postgres", dbURL)
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
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
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func createTables() {
	query := `
	CREATE TABLE IF NOT EXISTS prayer_times_cache (
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
	}
	
	json.NewEncoder(w).Encode(response)
}

// Indonesian cities with accurate coordinates
var indonesiaCities = map[string][3]interface{}{
	"jakarta":       {-6.2088, 106.8456, "Jakarta"},
	"bandung":       {-6.9175, 107.6191, "Bandung"},
	"surabaya":      {-7.2504, 112.7688, "Surabaya"},
	"medan":         {3.5952, 98.6722, "Medan"},
	"banda aceh":    {5.5483, 95.3238, "Banda Aceh"},
	"lhokseumawe":   {5.1870, 97.1413, "Lhokseumawe"},
	"yogyakarta":    {-7.8014, 110.3647, "Yogyakarta"},
	"makassar":      {-5.1477, 119.4327, "Makassar"},
	"denpasar":      {-8.65, 115.2167, "Denpasar"},
	"palembang":     {-2.9909, 104.7566, "Palembang"},
	"semarang":      {-6.9667, 110.4167, "Semarang"},
	"balikpapan":    {-1.2654, 116.8312, "Balikpapan"},
	"jayapura":      {-2.5337, 140.7181, "Jayapura"},
	"pontianak":     {0.0263, 109.3425, "Pontianak"},
	"padang":        {-0.9471, 100.4172, "Padang"},
	"pekanbaru":     {0.5071, 101.4478, "Pekanbaru"},
	"banjarmasin":   {-3.3194, 114.5906, "Banjarmasin"},
	"manado":        {1.4748, 124.8421, "Manado"},
	"kupang":        {-10.1718, 123.6075, "Kupang"},
	"ambon":         {-3.6954, 128.1814, "Ambon"},
	"solo":          {-7.5663, 110.8281, "Solo"},
	"malang":        {-7.9797, 112.6304, "Malang"},
	"samarinda":     {-0.5022, 117.1536, "Samarinda"},
	"jambi":         {-1.6101, 103.6131, "Jambi"},
	"bengkulu":      {-3.7928, 102.2607, "Bengkulu"},
	"lampung":       {-5.4292, 105.2610, "Bandar Lampung"},
	"mataram":       {-8.5833, 116.1167, "Mataram"},
	"palu":          {-0.8917, 119.8707, "Palu"},
	"kendari":       {-3.9450, 122.4989, "Kendari"},
	"gorontalo":     {0.5435, 123.0682, "Gorontalo"},
}

func getCitiesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var cities []map[string]interface{}
	for _, cityData := range indonesiaCities {
		city := map[string]interface{}{
			"name":      cityData[2].(string),
			"latitude":  cityData[0].(float64),
			"longitude": cityData[1].(float64),
		}
		cities = append(cities, city)
	}
	
	json.NewEncoder(w).Encode(cities)
}

func getCoordinatesByCity(city string) (float64, float64, string, error) {
	cityLower := strings.ToLower(city)
	for k, v := range indonesiaCities {
		if strings.Contains(k, cityLower) || strings.Contains(cityLower, k) || 
		   strings.Contains(strings.ToLower(v[2].(string)), cityLower) {
			return v[0].(float64), v[1].(float64), v[2].(string), nil
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
		Latitude:             lat,
		Longitude:            lon,
		Elevation:            0,
		CalculationMethod:    prayer.Kemenag, // Indonesian method
		AsrConvention:        prayer.Shafii,
		PreciseToSeconds:     false,
	}

	prayers, err := prayer.Calculate(config, date)
	if err != nil {
		// Fallback to simple calculation
		return calculateSimplePrayerTimes(lat, lon, date)
	}

	// Convert to local timezone (WIB/WITA/WIT based on longitude)
	timezone := getIndonesianTimezone(lon)
	loc, _ := time.LoadLocation(timezone)

	return PrayerTimes{
		Fajr:      prayers.Fajr.In(loc).Format("15:04"),
		Sunrise:   prayers.Sunrise.In(loc).Format("15:04"),
		Dhuhr:     prayers.Dhuhr.In(loc).Format("15:04"),
		Asr:       prayers.Asr.In(loc).Format("15:04"),
		Maghrib:   prayers.Maghrib.In(loc).Format("15:04"),
		Isha:      prayers.Isha.In(loc).Format("15:04"),
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

	for i, prayer := range prayers {
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