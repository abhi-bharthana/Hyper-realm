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
	// 1. Google Token (Access Token) Header se nikalna
	accessToken := r.Header.Get("X-Google-Token")
	if accessToken == "" {
		http.Error(w, "Missing Google Token", http.StatusBadRequest)
		return
	}

	// 2. Google Access Token Verify karo
	userInfo, err := auth.VerifyGoogleAccessToken(accessToken)
	if err != nil {
		http.Error(w, "Invalid Google Token", http.StatusUnauthorized)
		return
	}

	// 3. Email aur ID extract karna
	if userInfo.Email == "" {
		http.Error(w, "Email not provided by Google", http.StatusBadRequest)
		return
	}

	// 4. Database mein User check karo ya create karo
	user, err := db.FindOrCreateUser(userInfo.Sub, userInfo.Email)
	if err != nil {
		fmt.Printf("❌ ASLI DB ERROR: %v\n", err) // 👈 YEH NAYI LINE ADD KI HAI HUMNE!
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// 📢 4.5 AWAAZ LAGA DII: Send Data to Kafka so Search Engine can index it!
	// 🛠️ FIX: Agar naya user hai aur username empty hai, toh temporary safe name use karo
	safeUsername := user.Username
	if safeUsername == "" {
		safeUsername = fmt.Sprintf("NewUser_%v", user.HID)
	}
	events.PublishUserEvent(fmt.Sprintf("%v", user.HID), safeUsername, "User")

	// 5. Hyper ID JWT Generate karo
	token, err := auth.GenerateHyperToken(user.HID, user.Username, user.AccountStatus)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	// --- Multi-Project Redirect Logic ---
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")

	w.Header().Set("Content-Type", "application/json")

	response := map[string]interface{}{
		"token":  token,
		"status": user.AccountStatus,
	}

	if clientID != "" && redirectURI != "" {
		response["redirect_url"] = redirectURI + "?token=" + token + "&status=" + user.AccountStatus
	}

	// 6. Final Response bhejo
	json.NewEncoder(w).Encode(response)
}
