package main

import (
	"fmt"
	"log"
	"net/http"

	"hyper-search/internal/consumer" // 👈 Naya import
	"hyper-search/internal/engine"
)

func main() {
	fmt.Println("Starting Hyper-Search Core Engine...")

	// 1. Initialize Storage Engines & Schemas
	engine.InitFlash()

	// 2. Start Kafka Consumer in the background (Goroutine)
	go consumer.StartKafkaConsumer() // 👈 Listener on duty

	// 3. Setup API Routes
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/search/flash", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "success", "message": "Flash Search Core is Active"}`))
	})

	// 4. Start Server
	port := ":8082"
	fmt.Printf("Hyper-Search Server running on http://localhost%s\n", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Search engine failed to start: %v", err)
	}
}
