package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"hyper-id/internal/api"
	"hyper-id/internal/auth"
	"hyper-id/internal/db"

	"github.com/joho/godotenv"
)

// Middleware to enable CORS for development
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Next.js origin
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Google-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// 1. Load .env file
	godotenv.Load()

	fmt.Println("🚀 Initializing Hyper ID Service...")

	// 2. RSA Keys Load karo
	err := auth.InitKeys("./certs/private.pem") // Path check kar lena
	if err != nil {
		log.Fatalf("Critical: Could not load RSA keys: %v", err)
	}

	// --- DEBUG: TOKEN GENERATOR ---
	// Ye sirf testing ke liye hai, server start hote hi print ho jayega
	testToken, _ := auth.GenerateHyperToken("monster_01", "Abhishek", "active")
	fmt.Println("\n🔑 DEBUG JWT TOKEN:")
	fmt.Println(testToken)
	fmt.Println("---------------------------\n")

	// 3. Database Connect karo (Required for APIs)
	err = db.InitDB(
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	fmt.Println("✅ Database Connected Successfully!")

	// 4. Setup Routes
	mux := http.NewServeMux()

	// Auth Routes
	mux.HandleFunc("/auth/google", api.HandleGoogleLogin)
	mux.HandleFunc("/auth/onboarding", api.RequireAuth(api.HandleSetUsername))

	// Settings & Profile Routes (New)
	mux.HandleFunc("/api/settings", api.RequireAuth(api.HandleSettings))
	mux.HandleFunc("/api/v1/profile", api.RequireAuth(api.HandleGetProfile))

	// 5. Start Server
	port := ":8080"
	fmt.Printf("📡 Hyper ID Auth Server running on http://localhost%s\n", port)

	if err := http.ListenAndServe(port, enableCORS(mux)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
