package api

import (
	"encoding/json"
	"hyper-id/internal/db"
	"hyper-id/internal/models"
	"net/http"
)

func HandleSettings(w http.ResponseWriter, r *http.Request) {
	hid := r.Context().Value(UserIDKey).(string) // Middleware se HID nikala

	if r.Method == "GET" {
		s, _ := db.GetSettings(hid)
		json.NewEncoder(w).Encode(s)
	} else if r.Method == "POST" {
		var s models.Settings
		json.NewDecoder(r.Body).Decode(&s)
		db.UpsertSettings(hid, s)
		w.Write([]byte(`{"message": "Synced"}`))
	}
}
