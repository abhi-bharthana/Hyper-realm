package main

import (
	"hyper-hub/internal/api"
	"hyper-hub/internal/db"
	"hyper-hub/internal/events"
	"log"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var httpRequestsTotal = prometheus.NewCounterVec(
	prometheus.CounterOpts{
		Name: "http_requests_total",
		Help: "Total number of HTTP requests processed by Hyper-Hub.",
	},
	[]string{"path", "method"},
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
}

// 🛡️ Global CORS Middleware (Handling OPTIONS preflight properly)
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withMetrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		httpRequestsTotal.WithLabelValues(r.URL.Path, r.Method).Inc()
		next.ServeHTTP(w, r)
	})
}

func main() {
	log.Println("🚀 Initializing Hyper Hub...")

	db.InitDB()
	events.InitKafkaProducer()

	mux := http.NewServeMux()

	// Metrics (Unprotected)
	mux.Handle("/metrics", promhttp.Handler())

	// 🚀 API Routes (Wrapped ONLY with Auth & Metrics)
	// CORS middleware ab poore 'mux' ko wrap karega neeche
	mux.Handle("/api/v1/profile", withMetrics(api.RequireAuth(api.GetProfileHandler)))
	mux.Handle("/api/v1/profile/update", withMetrics(api.RequireAuth(api.UpdateProfileHandler)))
	mux.Handle("/api/v1/settings", withMetrics(api.RequireAuth(api.HandleSettings)))

	port := ":8081"

	// 🛡️ Global CORS wrap kiya (Handler mein)
	server := &http.Server{
		Addr:    port,
		Handler: corsMiddleware(mux),
	}

	log.Printf("⚡ Hyper Hub Server starting on %s", port)
	log.Fatal(server.ListenAndServe())
}
