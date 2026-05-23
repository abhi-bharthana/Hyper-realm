package api

import (
	"encoding/json"
	"fmt"
	"hyper-hub/internal/db"
	"hyper-hub/internal/models"
	"net/http"
)

// HandleSettings handles GET (fetch) and POST (sync) for user preferences
func HandleSettings(w http.ResponseWriter, r *http.Request) {
	// Middleware se injected HID nikal rahe hain
	hid, ok := r.Context().Value(UserHIDKey).(string)
	if !ok || hid == "" {
		http.Error(w, "Unauthorized: No HID found", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		// Fetch settings from DB
		s, err := db.GetSettings(hid)
		if err != nil {
			// Log error for internal tracking
			fmt.Printf("❌ Hub: Error fetching settings for %s: %v\n", hid, err)
			http.Error(w, "Could not fetch settings", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(s)

	case http.MethodPost:
		// Decode incoming settings
		var s models.Settings
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		// Update or Insert in DB
		if err := db.UpsertSettings(hid, s); err != nil {
			fmt.Printf("❌ Hub: Error syncing settings for %s: %v\n", hid, err)
			http.Error(w, "Database sync failed", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Settings Synced Successfully"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
