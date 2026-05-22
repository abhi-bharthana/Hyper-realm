package main

import (
	"hyper-hub/internal/api"
	"hyper-hub/internal/db"
	"log"
	"net/http"
)

// enableCORS: Browser security aur Preflight requests handle karne ke liye
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Frontend (localhost:3000) ko allow karo
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Preflight (OPTIONS) request ka turant jawab do
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	log.Println("🚀 Initializing Hyper Hub...")

	// 1. DB Initialization (Isme humne Retry Logic pehle hi daal diya hai)
	db.InitDB()

	// 2. Router Setup
	mux := http.NewServeMux()

	// Routes register karo
	mux.HandleFunc("/api/v1/profile", api.RequireAuth(api.GetProfileHandler))
	mux.HandleFunc("/api/v1/profile/update", api.RequireAuth(api.UpdateProfileHandler))

	// 3. Server Config
	// ":8081" ka matlab hai 0.0.0.0:8081 (Docker ke liye yahi zaroori hai)
	port := ":8081"
	log.Printf("⚡ Hyper Hub Server starting on %s", port)

	// Wrap Mux with CORS Middleware
	err := http.ListenAndServe(port, enableCORS(mux))
	if err != nil {
		log.Fatal("❌ ListenAndServe Error: ", err)
	}
}
