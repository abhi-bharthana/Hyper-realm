package api

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"regexp"

	"hyper-id/internal/auth"
	"hyper-id/internal/db"
)

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)

type OnboardingRequest struct {
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Nickname  string `json:"nickname"`
}

func HandleSetUsername(w http.ResponseWriter, r *http.Request) {
	ctxValue := r.Context().Value(UserIDKey)
	if ctxValue == nil {
		http.Error(w, "Unauthorized: Missing User ID", http.StatusUnauthorized)
		return
	}
	hid := ctxValue.(string)

	var req OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if !usernameRegex.MatchString(req.Username) || len(req.Username) < 3 {
		http.Error(w, "Invalid username format", http.StatusBadRequest)
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 1. Update h_users (Active status)
	_, err = tx.Exec(`UPDATE h_users SET username = $1, account_status = 'active' WHERE hid = $2`, req.Username, hid)
	if err != nil {
		http.Error(w, "Username already taken", http.StatusConflict)
		return
	}

	// 2. Insert h_profiles (User details)
	_, err = tx.Exec(`INSERT INTO h_profiles (hid, username, first_name, last_name, nickname) VALUES ($1, $2, $3, $4, $5)`,
		hid, req.Username, req.FirstName, req.LastName, req.Nickname)
	if err != nil {
		log.Println("DEBUG: DB Insert Error:", err)
		http.Error(w, "Error saving profile", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Finalizing error", http.StatusInternalServerError)
		return
	}

	// 3. Trigger Search Index Update (Asynchronous)
	go func() {
		// Docker internal networking: service name 'hyper-search' should resolve
		searchUrl := "http://hyper-search:8082/api/v1/search/index"

		payload := map[string]interface{}{
			"hid":        hid,
			"username":   req.Username,
			"first_name": req.FirstName,
			"last_name":  req.LastName,
			"nickname":   req.Nickname,
		}

		jsonData, _ := json.Marshal(payload)
		resp, err := http.Post(searchUrl, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Printf("❌ FAILED to notify search service (Hyper-Search unreachable): %v", err)
			return
		}
		defer resp.Body.Close()
		log.Println("⚡ [HTTP Notification] Search service sync complete.")
	}()

	// 4. Token Generation
	newToken, err := auth.GenerateHyperToken(hid, req.Username, "active")
	if err != nil {
		http.Error(w, "Failed to refresh identity token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Onboarding complete! Welcome to Hyper-realm.",
		"token":   newToken,
		"status":  "active",
	})
}
