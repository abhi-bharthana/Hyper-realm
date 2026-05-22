package api

import (
	"context"
	"hyper-id/internal/auth"
	"net/http"
	"strings"
)

// Context key custom type taaki collisions na hon
type contextKey string

const UserIDKey contextKey = "user_hid"

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization Header", http.StatusUnauthorized)
			return
		}

		// "Bearer <token>" format se token extract karna
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Token Verify karna (Ye function hume auth/jwt.go mein add karna hoga)
		claims, err := auth.VerifyHyperToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid or Expired Token", http.StatusUnauthorized)
			return
		}

		// HID ko request context mein inject karna
		ctx := context.WithValue(r.Context(), UserIDKey, claims.HID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
