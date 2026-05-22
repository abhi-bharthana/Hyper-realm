package hyperhub

import (
	"hyper-hub/internal/api"
	"log"
	"net/http"
)

// main.go mein aisa logic hona chahiye
func main() {
	mux := http.NewServeMux()

	// Apne routes register karo
	mux.HandleFunc("/api/v1/profile", api.RequireAuth(api.GetProfileHandler))
	mux.HandleFunc("/api/v1/profile/update", api.RequireAuth(api.UpdateProfileHandler))

	// CORS Middleware wrap karo
	handlerWithCORS := enableCORS(mux)

	log.Println("⚡ Hyper Hub running on http://localhost:8081")
	http.ListenAndServe(":8081", handlerWithCORS)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// IMPORTANT: Preflight request handle karna hi padega
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
