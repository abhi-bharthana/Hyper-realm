package api

import (
	"net/http"

	"github.com/hyper-realm/hyper-local/internal/api/handlers"
	"github.com/hyper-realm/hyper-local/internal/api/middleware"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// Public Routes (Bina login ke dekh sakte hain)
	mux.HandleFunc("/api/v1/categories", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handlers.GetCategories(w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	// Protected Routes (Sirf authorized users/admins ke liye)
	mux.Handle("/api/v1/admin/categories", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handlers.CreateCategory(w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})))

	return mux
}
