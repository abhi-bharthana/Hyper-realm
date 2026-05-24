package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"hyper-search/internal/api"
	"hyper-search/internal/consumer"
	"hyper-search/internal/engine"
)

// CORS Middleware wrapper
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	fmt.Println("🚀 Starting Hyper-Search Core Engine...")

	// 1. Initialize Storage Engines
	engine.InitFlash()

	// 2. Start Kafka Consumer
	go consumer.StartKafkaConsumer()

	// 3. Setup API Routes
	mux := http.NewServeMux()

	// Search Endpoint
	mux.HandleFunc("/api/v1/search/flash", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		query := r.URL.Query().Get("q")
		if query == "" {
			http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
			return
		}

		results, err := engine.SearchFlash(query)
		if err != nil {
			log.Printf("Search error: %v", err)
			http.Error(w, "Flash search engine failed", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}))

	// Index Sync Endpoint (Direct Onboarding Sync)
	mux.HandleFunc("/api/v1/search/index", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		api.HandleSearchIndex(w, r)
	}))

	// 4. Start Server
	port := ":8082"
	log.Printf("✅ Hyper-Search Server running on http://localhost%s", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("❌ Search engine failed to start: %v", err)
	}
}
