package api

import (
	"encoding/json"
	"net/http"
)

// User Profile structure jo Auth service handle karegi (Base Info)
type UserResponse struct {
	HID   string `json:"hid"`
	Email string `json:"email"`
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	// Tera purana logic yahan aayega jo Token se user nikalta hai
	// Abhi ke liye ek placeholder response:
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Auth Service User Node Active",
	})
}
