package middleware

import (
	"net/http"
	"os"
	"strings"
)

// AuthMiddleware intercepts requests and validates with Hyper ID
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: Missing or invalid token", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Call existing Hyper ID Service to validate
		hyperIDUrl := os.Getenv("HYPER_ID_SERVICE_URL") + "/api/validate"
		req, _ := http.NewRequest("POST", hyperIDUrl, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		client := &http.Client{}
		resp, err := client.Do(req)

		if err != nil || resp.StatusCode != http.StatusOK {
			http.Error(w, "Unauthorized: Neural link hand-shake rejected", http.StatusUnauthorized)
			return
		}

		// Token is valid, proceed to the actual handler
		next.ServeHTTP(w, r)
	})
}
