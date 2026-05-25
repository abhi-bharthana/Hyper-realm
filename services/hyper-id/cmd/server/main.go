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

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
