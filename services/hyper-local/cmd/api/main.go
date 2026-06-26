package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/hyper-realm/hyper-local/internal/api"
	"github.com/hyper-realm/hyper-local/internal/database"
)

func main() {
	fmt.Println("🚀 Booting up Hyper-Local Engine...")

	// 1. Connect to Database
	database.ConnectDB()

	// 2. Setup Routes
	router := api.SetupRoutes()

	// 3. Start Server on port 8085 (as defined in docker-compose.local.yml)
	port := ":8085"
	fmt.Printf("📦 Commerce Service listening on %s\n", port)

	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
