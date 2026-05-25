package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"hyper-id/internal/api"
	"hyper-id/internal/auth"
	"hyper-id/internal/db"
	"hyper-id/internal/events"

	"github.com/joho/godotenv"
)

func globalMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("📢 [Hyper-ID] Incoming Request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

		// 🎯 ALLOW EXPLICIT LOCALHOST DEVELOPMENT ORIGIN
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// 🎯 CRITICAL CORS FIX: Whitelisting 'X-Google-Token' to pass preflight validation check seamlessly
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Google-Token, Accept, Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// 🎬 IMMEDIATELY INTERCEPT BROWSER PREFLIGHT OPTIONS REQUEST WITH SUCCESS CODE
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Note: .env file not found, using system environment variables")
	}

	fmt.Println("Starting Hyper ID Service...")

	events.InitKafkaProducer()

	err = auth.InitKeys("certs/private.pem")
	if err != nil {
		log.Fatalf("Critical: Could not load RSA keys: %v", err)
	}

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	err = db.InitDB(dbHost, dbPort, dbUser, dbPass, dbName)
	if err != nil {
		log.Fatalf("Critical: Database connection failed: %v", err)
	}
	fmt.Println("Database Connected Successfully!")

	mux := http.NewServeMux()

	// 🎯 FIXED ROUTE RESOLUTION: Dynamic suffix stripping prevents edge-case mapping failures
	mux.HandleFunc("/api/v1/auth/google", func(w http.ResponseWriter, r *http.Request) {
		cleanPath := strings.TrimSuffix(r.URL.Path, "/")
		if cleanPath != "/api/v1/auth/google" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error": "Endpoint route mapping invalid inside Hyper-ID"}`))
			return
		}
		api.HandleGoogleLogin(w, r)
	})

	mux.HandleFunc("/api/v1/auth/onboarding", api.RequireAuth(api.HandleSetUsername))

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

	port := ":8080"
	fmt.Printf("Hyper ID Auth Server running on http://localhost%s\n", port)

	if err := http.ListenAndServe(port, globalMiddleware(mux)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
