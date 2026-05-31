package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"hyper-hub/internal/api"
	"hyper-hub/internal/db"
	"hyper-hub/internal/events"

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

	mux.Handle("/metrics", promhttp.Handler())

	// Protected API Routes
	mux.Handle("/api/v1/profile", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetProfileHandler))))
	mux.Handle("/api/v1/profile/update", withMetrics(api.RequireAuth(http.HandlerFunc(api.UpdateProfileHandler))))
	mux.Handle("/api/v1/settings", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleSettings))))
	mux.Handle("/api/v1/users/requests", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleGetPendingRequests))))
	mux.Handle("/api/v1/users/requests/send", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleSendRequest))))
	mux.Handle("/api/v1/users/friends", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleGetFriendsList))))
	mux.Handle("/api/v1/users/requests/accept", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleAcceptRequest))))
	mux.Handle("/api/v1/users/requests/decline", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleDeclineRequest))))
	mux.Handle("/api/v1/friends", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetFriendsList))))

	// Public & Discover Routes
	mux.Handle("/api/v1/profile/view", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetOtherProfileHandler))))
	mux.Handle("/api/v1/search", withMetrics(http.HandlerFunc(api.SearchUsersHandler)))
	mux.Handle("/api/v1/users/discover", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetDiscoverProfilesHandler))))
	mux.Handle("/api/v1/users/requests/sent", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleGetSentRequests))))
	mux.Handle("/api/v1/users/requests/cancel", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleCancelRequest))))

	port := ":8081"
	server := &http.Server{
		Addr:    port,
		Handler: mux,
	}

	// ⚡ Run Server in a Goroutine
	go func() {
		log.Printf("⚡ Hyper Hub Server starting on %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// 🛑 Graceful Shutdown Logic
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("\nGraceful shutdown initiated for Hyper Hub...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Hyper-Hub exited properly.")
}
