package main

import (
	"fmt"
	"log"
	"net/http"
	"os" // Environment variables read karne ke liye
	"strings"

	"hyper-id/internal/api"
	"hyper-id/internal/auth"
	"hyper-id/internal/db"
	"hyper-id/internal/events" // 👈 Naya Import: Kafka Producer ke liye

	"github.com/joho/godotenv" // .env file load karne ke liye
)

// Request Logging + CORS Middleware
func globalMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Log incoming requests (Scientist Debug Mode)
		log.Printf("📢 [Hyper-ID] Incoming Request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

		// 2. CORS Headers Setup
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// 🚨 CORS FIX: X-Google-Token added to allowed headers!
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Google-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle Preflight OPTIONS
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// 1. Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: .env file not found, using system environment variables")
	}

	fmt.Println("Starting Hyper ID Service...")

	// 🚀 INJECTING THE VOICE: Initialize Kafka Producer right after startup
	events.InitKafkaProducer()

	// 2. Load RSA Private Key
	err = auth.InitKeys("certs/private.pem")
	if err != nil {
		log.Fatalf("Critical: Could not load RSA keys: %v", err)
	}

	// 3. Initialize Database Connection using Environment Variables
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Database Connect
	err = db.InitDB(dbHost, dbPort, dbUser, dbPass, dbName)
	if err != nil {
		log.Fatalf("Critical: Database connection failed: %v", err)
	}
	fmt.Println("Database Connected Successfully!")

	// 4. Setup Routes
	mux := http.NewServeMux()

	// API Routes (Explicit path patterns matching exact client targets)
	mux.HandleFunc("/api/v1/auth/google", func(w http.ResponseWriter, r *http.Request) {
		// Strict clean mapping check to avoid multiplexer bypass
		if r.URL.Path != "/api/v1/auth/google" && r.URL.Path != "/api/v1/auth/google/" {
			http.NotFound(w, r)
			return
		}
		api.HandleGoogleLogin(w, r)
	})

	mux.HandleFunc("/api/v1/auth/onboarding", api.RequireAuth(api.HandleSetUsername))
	mux.HandleFunc("/api/v1/settings", api.RequireAuth(api.HandleSettings))

	// Catch-all route for static files (Only executes if prefix API paths mismatch)
	fs := http.FileServer(http.Dir("frontend"))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error": "API Endpoint Not Found inside Hyper-ID"}`))
			return
		}
		fs.ServeHTTP(w, r)
	})

	// 5. Start Server
	port := ":8080"
	fmt.Printf("Hyper ID Auth Server running on http://localhost%s\n", port)

	// Wrapping multiplexer inside the global logger + CORS handler stack
	if err := http.ListenAndServe(port, globalMiddleware(mux)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
