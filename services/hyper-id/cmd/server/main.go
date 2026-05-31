package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"hyper-id/internal/api"
	"hyper-id/internal/auth"
	"hyper-id/internal/db"
	"hyper-id/internal/events"

	"github.com/joho/godotenv"
)

// 🚀 NAYA: Custom CORS Middleware Function
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set basic CORS Headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Production me isko apne frontend URL se replace kar dena
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")

		// 🚀 THE MAGIC LINE: Yahan humne x-google-token aur baaki required headers allow kiye hain
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-google-token, x-user-hid, Accept")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Browser ki Preflight (OPTIONS) request ko yahin intercept karke 200 OK de do
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Agar normal request hai, toh aage apne actual handler (Mux) ko pass kar do
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

	// 🎯 Pure API Routes (Auth Only)
	mux.HandleFunc("/api/v1/auth/google", api.HandleGoogleLogin)
	mux.HandleFunc("/api/v1/auth/onboarding", api.RequireAuth(api.HandleSetUsername))

	// 🗑️ Sirf API 404 return karega
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "Hyper-ID API Endpoint Not Found"}`))
	})

	port := ":8080"

	// 🚀 NAYA: Apne mux ko corsMiddleware se wrap kar diya
	server := &http.Server{
		Addr:    port,
		Handler: corsMiddleware(mux),
	}

	// ⚡ Run Server in a Goroutine
	go func() {
		fmt.Printf("Hyper ID Auth Server running on http://localhost%s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// 🛑 Graceful Shutdown Logic
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	fmt.Println("\nGraceful shutdown initiated for Hyper-ID...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	fmt.Println("Hyper-ID exited properly.")
}
