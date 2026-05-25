package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"hyper-id/internal/auth"
	"hyper-id/internal/db"
	"hyper-id/internal/events" // Kafka Event trigger karne ke liye
)

// Response structure for better type safety
type LoginResponse struct {
	Token  string `json:"token"`
	Status string `json:"status"` // 'pending_onboarding' ya 'active'
}

func HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	// 1. Google Token (ID Token) Header se nikalna (Next.js bhej raha hai X-Google-Token)
	accessToken := r.Header.Get("X-Google-Token")
	if accessToken == "" {
		http.Error(w, "Missing Google Token in custom headers", http.StatusBadRequest)
		return
	}

	// 2. Google Token info validation execution
	userInfo, err := auth.VerifyGoogleAccessToken(accessToken)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid Google Identity Token: %v", err), http.StatusUnauthorized)
		return
	}

	// 3. Email aur ID extract karna directly from validated Google payload
	if userInfo.Email == "" || userInfo.Sub == "" {
		http.Error(w, "Identity context or email scope not provided by Google", http.StatusBadRequest)
		return
	}

	// 🎯 FIXED: Removed hardcoded dummy profiles. Using real verified data parameters now!
	googleEmail := userInfo.Email
	googleSub := userInfo.Sub

	// 4. Database mein User check karo ya create karo inside h_users table
	user, err := db.FindOrCreateUser(googleSub, googleEmail)
	if err != nil {
		fmt.Printf("❌ ASLI DB ERROR INSIDE FIND_OR_CREATE: %v\n", err)
		http.Error(w, "Cluster identity database transaction error", http.StatusInternalServerError)
		return
	}

	// 📢 4.5 AWAAZ LAGA DII: Send Data to Kafka so Search Engine can index it!
	safeUsername := user.Username
	if safeUsername == "" {
		safeUsername = fmt.Sprintf("NewUser_%s", user.HID)
	}
	events.PublishUserEvent(fmt.Sprintf("%v", user.HID), safeUsername, "User")

	// 5. Hyper ID JWT Generate karo using updated dynamic statuses
	token, err := auth.GenerateHyperToken(user.HID, user.Username, user.AccountStatus)
	if err != nil {
		http.Error(w, "Token cryptographic generation signed failed", http.StatusInternalServerError)
		return
	}

	// --- Multi-Project Redirect Logic ---
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")

	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"token":  token,
		"status": user.AccountStatus, // 'pending_onboarding' or 'active'
	}

	if clientID != "" && redirectURI != "" {
		response["redirect_url"] = redirectURI + "?token=" + token + "&status=" + user.AccountStatus
	}

	// 6. Final Serialized Response output
	json.NewEncoder(w).Encode(response)
}
