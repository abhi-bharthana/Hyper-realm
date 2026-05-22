package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserHIDKey contextKey = "user_hid"

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorised: No Token", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// 1. RSA Public Key Load karo (Jo humne abhi ls karke dekhi)
		keyPath := "/app/certs/public.pem"
		verifyBytes, err := os.ReadFile(keyPath)
		if err != nil {
			fmt.Printf("❌ Hub: Error reading public key: %v\n", err)
			http.Error(w, "Auth Config Error", http.StatusInternalServerError)
			return
		}

		// 2. Parse RSA Public Key
		verifyKey, err := jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
		if err != nil {
			fmt.Printf("❌ Hub: Error parsing public key: %v\n", err)
			http.Error(w, "Auth Config Error", http.StatusInternalServerError)
			return
		}

		// 3. Token Verify karo
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure signing method RSA hai
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return verifyKey, nil
		})

		if err != nil || !token.Valid {
			fmt.Printf("❌ Hub: JWT Validation Failed: %v\n", err)
			http.Error(w, "Unauthorised: Bad Session", http.StatusUnauthorized)
			return
		}

		// 4. Claims se HID extract karo
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			hid, ok := claims["hid"].(string)
			if !ok {
				http.Error(w, "Unauthorised: HID missing in token", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), UserHIDKey, hid)
			next.ServeHTTP(w, r.WithContext(ctx))
		}
	}
}
