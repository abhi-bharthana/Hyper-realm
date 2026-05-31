package api

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserHIDKey contextKey = "user_hid"

// 🧠 Memory Cache for Public Key (Disk I/O bachane ke liye)
var cachedPublicKey *rsa.PublicKey

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorised: No Token", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// 1. Load Key Only ONCE (Optimization)
		if cachedPublicKey == nil {
			keyPath := os.Getenv("JWT_PUBLIC_KEY_PATH")
			if keyPath == "" {
				keyPath = "/app/certs/public_key.pem"
			}

			verifyBytes, err := os.ReadFile(keyPath)
			if err != nil {
				fmt.Printf("❌ Hub: Error reading public key at %s: %v\n", keyPath, err)
				http.Error(w, "Auth Config Error", http.StatusInternalServerError)
				return
			}

			verifyKey, err := jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
			if err != nil {
				fmt.Printf("❌ Hub: Error parsing public key: %v\n", err)
				http.Error(w, "Auth Config Error", http.StatusInternalServerError)
				return
			}
			cachedPublicKey = verifyKey
		}

		// 2. Token Verify karo (using Cached Key)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return cachedPublicKey, nil
		})

		if err != nil || !token.Valid {
			fmt.Printf("❌ Hub: JWT Validation Failed: %v\n", err)
			http.Error(w, "Unauthorised: Bad Session", http.StatusUnauthorized)
			return
		}

		// 3. Claims extract karo
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			hid, ok := claims["hid"].(string)
			if !ok {
				http.Error(w, "Unauthorised: HID missing in token", http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), UserHIDKey, hid)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Unauthorised: Invalid Claims", http.StatusUnauthorized)
			return
		}
	}
}
