package api

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"

	"hyper-id/internal/auth" // Token generation ke liye
	"hyper-id/internal/db"
)

// Username Validation Pattern
var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)

type OnboardingRequest struct {
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Nickname  string `json:"nickname"`
}

func HandleSetUsername(w http.ResponseWriter, r *http.Request) {
	// 1. HID Check from Context
	ctxValue := r.Context().Value(UserIDKey)
	if ctxValue == nil {
		log.Println("DEBUG: HID not found in context!")
		http.Error(w, "Unauthorized: No user ID found", http.StatusUnauthorized)
		return
	}
	hid := ctxValue.(string)
	log.Printf("DEBUG: Attempting onboarding for HID: [%s]", hid)

	var req OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("DEBUG: JSON Decode Error:", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Basic Validation
	if !usernameRegex.MatchString(req.Username) || len(req.Username) < 3 {
		http.Error(w, "Invalid username format", http.StatusBadRequest)
		return
	}

	// Database Transaction Start
	tx, err := db.DB.Begin()
	if err != nil {
		log.Println("DEBUG: DB Transaction Begin Error:", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// 2. h_users update: Username set karo aur status 'active' karo
	res, err := tx.Exec(`
		UPDATE h_users 
		SET username = $1, account_status = 'active' 
		WHERE hid = $2 AND account_status = 'pending_onboarding'`,
		req.Username, hid)

	if err != nil {
		log.Println("DEBUG: SQL Update User Error:", err)
		http.Error(w, "Username already taken", http.StatusConflict)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		log.Println("DEBUG: No rows updated! User might already be active.")
		http.Error(w, "User already active or not found", http.StatusBadRequest)
		return
	}

	// 3. h_profiles insert: Personal details save karo
	_, err = tx.Exec(`
		INSERT INTO h_profiles (hid, first_name, last_name, nickname) 
		VALUES ($1, $2, $3, $4)`,
		hid, req.FirstName, req.LastName, req.Nickname)

	if err != nil {
		log.Println("DEBUG: SQL Insert Profile Error:", err)
		http.Error(w, "Error saving profile", http.StatusInternalServerError)
		return
	}

	// Transaction Commit
	if err := tx.Commit(); err != nil {
		log.Println("DEBUG: Transaction Commit Error:", err)
		http.Error(w, "Finalizing error", http.StatusInternalServerError)
		return
	}

	// 4. GENERATE NEW TOKEN: Ab user 'active' hai, toh naya token chahiye
	newToken, err := auth.GenerateHyperToken(hid, req.Username, "active")
	if err != nil {
		log.Println("DEBUG: New Token Gen Error:", err)
		http.Error(w, "Failed to refresh identity token", http.StatusInternalServerError)
		return
	}

	log.Println("DEBUG: Onboarding successful. New token issued for:", req.Username)

	// Final JSON Response (with Token)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Onboarding complete! Welcome to Hyper-realm.",
		"token":   newToken,
		"status":  "active",
	})
}
