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

func withMetrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		httpRequestsTotal.WithLabelValues(r.URL.Path, r.Method).Inc()
		next.ServeHTTP(w, r)
	})
}

func main() {
	log.Println("🚀 Initializing Hyper Hub...")

	// Initialize Services
	db.InitDB()
	events.InitKafkaProducer()

	mux := http.NewServeMux()

	// Metrics (Unprotected)
	mux.Handle("/metrics", promhttp.Handler())

	// ✅ PROTECTED ROUTES (Require Auth)
	mux.Handle("/api/v1/profile", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetProfileHandler))))
	mux.Handle("/api/v1/profile/update", withMetrics(api.RequireAuth(http.HandlerFunc(api.UpdateProfileHandler))))
	mux.Handle("/api/v1/settings", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleSettings))))

	// 🔗 Network & Connection Routes (Protected) - YAHAN UPDATE KIYA HAI
	mux.Handle("/api/v1/users/requests", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleGetPendingRequests))))
	mux.Handle("/api/v1/users/requests/send", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleSendRequest))))
	mux.Handle("/api/v1/users/friends", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleGetFriendsList))))
	mux.Handle("/api/v1/users/requests/accept", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleAcceptRequest))))
	mux.Handle("/api/v1/users/requests/decline", withMetrics(api.RequireAuth(http.HandlerFunc(api.HandleDeclineRequest))))

	// Purana routes hata diye gaye hain ya uncomment kar sakte hain agar unki alag dependency hai
	mux.Handle("/api/v1/friends", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetFriendsList))))
	// mux.Handle("/api/v1/follow", withMetrics(api.RequireAuth(http.HandlerFunc(api.ToggleFollowHandler))))

	// 🚀 PUBLIC ROUTE (View other profiles by HID)
	mux.Handle("/api/v1/profile/view", withMetrics(api.RequireAuth(http.HandlerFunc(api.GetOtherProfileHandler))))
	mux.Handle("/api/v1/search", withMetrics(http.HandlerFunc(api.SearchUsersHandler)))

	port := ":8081"
	server := &http.Server{
		Addr:    port,
		Handler: mux,
	}

	log.Printf("⚡ Hyper Hub Server starting on %s", port)
	log.Fatal(server.ListenAndServe())
}
