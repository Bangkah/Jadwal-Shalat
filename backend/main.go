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
	"time"

	"github.com/gorilla/mux"
	_ "github.com/go-sql-driver/mysql"
	"github.com/rs/cors"
)

type PrayerTimes struct {
	Date     string  `json:"date"`
	Fajr     string  `json:"fajr"`
	Sunrise  string  `json:"sunrise"`
	Dhuhr    string  `json:"dhuhr"`
	Asr      string  `json:"asr"`
	Maghrib  string  `json:"maghrib"`
	Isha     string  `json:"isha"`
	Latitude float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City     string  `json:"city,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var db *sql.DB

func main() {
	// Initialize database connection
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	db, err = sql.Open("mysql", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test database connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Successfully connected to database")

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

func getPrayerTimesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	latStr := r.URL.Query().Get("latitude")
	lonStr := r.URL.Query().Get("longitude")
	dateStr := r.URL.Query().Get("date")
	city := r.URL.Query().Get("city")

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

	// Parse date or use today
	var targetDate time.Time
	if dateStr == "" {
		targetDate = time.Now()
	} else {
		targetDate, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			respondWithError(w, "invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	}

	// Check cache first
	cachedTimes, err := getCachedPrayerTimes(latitude, longitude, targetDate)
	if err == nil && cachedTimes != nil {
		cachedTimes.City = city
		json.NewEncoder(w).Encode(cachedTimes)
		return
	}

	// Calculate prayer times
	prayerTimes := calculatePrayerTimes(latitude, longitude, targetDate)
	prayerTimes.City = city

	// Cache the result
	cachePrayerTimes(prayerTimes)

	json.NewEncoder(w).Encode(prayerTimes)
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
	prayerTimes := calculatePrayerTimes(latitude, longitude, now)

	currentTime := now.Format("15:04")
	var currentPrayer, nextPrayer string
	var timeUntilNext string

	prayers := []struct {
		name string
		time string
	}{
		{"Fajr", prayerTimes.Fajr},
		{"Sunrise", prayerTimes.Sunrise},
		{"Dhuhr", prayerTimes.Dhuhr},
		{"Asr", prayerTimes.Asr},
		{"Maghrib", prayerTimes.Maghrib},
		{"Isha", prayerTimes.Isha},
	}

	for i, prayer := range prayers {
		if currentTime < prayer.time {
			if i > 0 {
				currentPrayer = prayers[i-1].name
			} else {
				currentPrayer = "Isha"
			}
			nextPrayer = prayer.name
			timeUntilNext = calculateTimeDifference(currentTime, prayer.time)
			break
		}
	}

	if nextPrayer == "" {
		currentPrayer = "Isha"
		nextPrayer = "Fajr"
		timeUntilNext = "Tomorrow"
	}

	response := map[string]interface{}{
		"current_prayer":   currentPrayer,
		"next_prayer":      nextPrayer,
		"time_until_next":  timeUntilNext,
		"prayer_times":     prayerTimes,
	}

	json.NewEncoder(w).Encode(response)
}

func calculatePrayerTimes(latitude, longitude float64, date time.Time) PrayerTimes {
	// Using simplified calculation method
	// For production, consider using a dedicated library like github.com/hablullah/go-prayer

	year, month, day := date.Date()
	timezone := float64(date.UTC().Hour() - date.Hour())

	// Julian date calculation
	a := (14 - int(month)) / 12
	y := year + 4800 - a
	m := int(month) + 12*a - 3
	jd := day + (153*m+2)/5 + 365*y + y/4 - y/100 + y/400 - 32045

	// Sun declination and equation of time
	d := float64(jd) - 2451545.0
	g := 357.529 + 0.98560028*d
	q := 280.459 + 0.98564736*d
	l := q + 1.915*sin(g) + 0.020*sin(2*g)

	e := 23.439 - 0.00000036*d
	ra := atan2(cos(e)*sin(l), cos(l)) * 180 / math.Pi
	dec := asin(sin(e)*sin(l)) * 180 / math.Pi

	eqt := q/15 - fixHour(ra/15)

	// Prayer times calculation
	fajrTime := calculateTime(18, date, latitude, longitude, dec, eqt, timezone)
	sunriseTime := calculateTime(0.833, date, latitude, longitude, dec, eqt, timezone)
	dhuhrTime := fixHour(12 - timezone - longitude/15 - eqt)
	asrTime := calculateAsrTime(1, date, latitude, longitude, dec, eqt, timezone)
	maghribTime := calculateTime(0.833, date, latitude, longitude, dec, eqt, timezone)
	ishaTime := calculateTime(18, date, latitude, longitude, dec, eqt, timezone)

	return PrayerTimes{
		Date:      date.Format("2006-01-02"),
		Fajr:      formatTime(fajrTime),
		Sunrise:   formatTime(sunriseTime),
		Dhuhr:     formatTime(dhuhrTime),
		Asr:       formatTime(asrTime),
		Maghrib:   formatTime(maghribTime),
		Isha:      formatTime(ishaTime),
		Latitude:  latitude,
		Longitude: longitude,
	}
}

func calculateTime(angle float64, date time.Time, latitude, longitude, dec, eqt, timezone float64) float64 {
	t := 180 / math.Pi * acos((-sin(angle)-sin(latitude)*sin(dec))/(cos(latitude)*cos(dec)))

	if angle > 5 { // Fajr or Isha
		return fixHour(12 - t/15 - timezone - longitude/15 - eqt)
	}
	return fixHour(12 + t/15 - timezone - longitude/15 - eqt)
}

func calculateAsrTime(factor float64, date time.Time, latitude, longitude, dec, eqt, timezone float64) float64 {
	angle := -acot(factor + tan(math.Abs(latitude-dec)))
	return calculateTime(angle, date, latitude, longitude, dec, eqt, timezone)
}

func getCachedPrayerTimes(latitude, longitude float64, date time.Time) (*PrayerTimes, error) {
	if db == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	query := `
		SELECT date, fajr, sunrise, dhuhr, asr, maghrib, isha, latitude, longitude
		FROM prayer_times_cache
		WHERE latitude = $1 AND longitude = $2 AND date = $3
		AND created_at > NOW() - INTERVAL '7 days'
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		ON CONFLICT (date, latitude, longitude) DO UPDATE
		SET fajr = $2, sunrise = $3, dhuhr = $4, asr = $5, maghrib = $6, isha = $7, created_at = NOW()
	`

	_, err := db.Exec(query, pt.Date, pt.Fajr, pt.Sunrise, pt.Dhuhr, pt.Asr, pt.Maghrib, pt.Isha, pt.Latitude, pt.Longitude)
	return err
}

// Helper functions
func sin(deg float64) float64 {
	return math.Sin(deg * math.Pi / 180)
}

func cos(deg float64) float64 {
	return math.Cos(deg * math.Pi / 180)
}

func tan(deg float64) float64 {
	return math.Tan(deg * math.Pi / 180)
}

func asin(x float64) float64 {
	return math.Asin(x) * 180 / math.Pi
}

func acos(x float64) float64 {
	return math.Acos(x) * 180 / math.Pi
}

func atan2(y, x float64) float64 {
	return math.Atan2(y, x)
}

func acot(x float64) float64 {
	return math.Pi/2 - math.Atan(x)
}

func fixHour(hour float64) float64 {
	return hour - 24*math.Floor(hour/24)
}

func formatTime(time float64) string {
	time = fixHour(time + 0.5/60)
	hours := int(math.Floor(time))
	minutes := int(math.Floor((time - float64(hours)) * 60))
	return fmt.Sprintf("%02d:%02d", hours, minutes)
}

func calculateTimeDifference(current, target string) string {
	layout := "15:04"
	currentTime, _ := time.Parse(layout, current)
	targetTime, _ := time.Parse(layout, target)

	diff := targetTime.Sub(currentTime)
	hours := int(diff.Hours())
	minutes := int(diff.Minutes()) % 60

	return fmt.Sprintf("%dh %dm", hours, minutes)
}

func respondWithError(w http.ResponseWriter, message string, code int) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}
