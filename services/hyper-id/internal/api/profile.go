package api

import (
	"encoding/json"
	"hyper-id/internal/db"
	"net/http"
)

func HandleGetProfile(w http.ResponseWriter, r *http.Request) {
	// UserIDKey internal/api/middleware.go mein defined hai
	hid, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	profile, err := db.GetUserProfile(hid)
	if err != nil || profile == nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
