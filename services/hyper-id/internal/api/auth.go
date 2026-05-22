package api

import (
	"database/sql"
	"encoding/json"
	"hyper-id/internal/auth" // Apne hissab se import path match kar lena
	"net/http"

	"github.com/google/uuid"
)

type GoogleAuthRequest struct {
	Token string `json:"token"`
}

func GoogleAuthHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req GoogleAuthRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		// [Yahan tera Google Token parse karne ka logic aayega jisse email aur name milega]
		// Maan lete hain humein Google se ye data mila:
		googleEmail := "abhi.yadav@gmail.com"
		googleStatus := "active"

		var hid string
		var username string

		// Check karo kya user pehle se registered hai
		err := db.QueryRow("SELECT hid, username FROM users WHERE email = $1", googleEmail).Scan(&hid, &username)

		if err == sql.ErrNoRows {
			// NAYA USER ENTRANCE: Unique Username banao
			var genErr error
			username, genErr = auth.GenerateUniqueUsername(db, googleEmail)
			if genErr != nil {
				http.Error(w, "Username generation failed", http.StatusInternalServerError)
				return
			}

			hid = uuid.New().String()

			// Insert into users table
			_, insertErr := db.Exec("INSERT INTO users (hid, username, email, status) VALUES ($1, $2, $3, $4)",
				hid, username, googleEmail, googleStatus)
			if insertErr != nil {
				http.Error(w, "User creation failed", http.StatusInternalServerError)
				return
			}
		} else if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		// Token Generate karo (Tera shared code use ho raha hai yahan)
		token, err := auth.GenerateHyperToken(hid, username, googleStatus)
		if err != nil {
			http.Error(w, "Token signing failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": token})
	}
}
