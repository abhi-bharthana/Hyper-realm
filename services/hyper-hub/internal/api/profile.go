package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"hyper-hub/internal/db"
	"hyper-hub/internal/models"
)

// 3. GetOtherProfileHandler: Kisi bhi user ki public profile dekhne ke liye
func GetOtherProfileHandler(w http.ResponseWriter, r *http.Request) {
	// Query param se 'hid' lo (e.g., /api/v1/profile?hid=xyz)
	targetHID := r.URL.Query().Get("hid")
	if targetHID == "" {
		http.Error(w, "HID is required", http.StatusBadRequest)
		return
	}

	// Naya Struct jo Profile + Connection Status dono hold karega
	type ProfileWithConnection struct {
		models.UserProfile
		ConnectionStatus string `json:"connection_status"`
	}

	var p ProfileWithConnection

	// Default status
	p.ConnectionStatus = "none"

	// 🎯 FIX: Table ka naam wapas 'user_profiles' kar diya hai
	query := `SELECT hid, nickname, COALESCE(bio, ''), COALESCE(avatar_url, ''), COALESCE(rank, 'Agent'), COALESCE(trust_score, 1.0) 
              FROM user_profiles WHERE hid=$1`

	err := db.DB.QueryRow(query, targetHID).Scan(
		&p.HID, &p.Nickname, &p.Bio, &p.AvatarURL, &p.Rank, &p.TrustScore,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Profile not found", http.StatusNotFound)
		} else {
			log.Printf("❌ [Hyper-Hub] DB Error in GetOtherProfile: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		return
	}

	// ⚡ CONNECTION STATUS LOGIC
	// Context se apna HID nikalne ka try karo (Agar route authenticated hai)
	myHIDContext := r.Context().Value(UserHIDKey)

	if myHIDContext != nil {
		myHID := myHIDContext.(string)

		if myHID == targetHID {
			p.ConnectionStatus = "self"
		} else {
			var status string
			err = db.DB.QueryRow(`
                SELECT status FROM h_connections 
                WHERE (sender_hid = $1 AND receiver_hid = $2) 
                OR (sender_hid = $2 AND receiver_hid = $1)`,
				myHID, targetHID).Scan(&status)

			if err == nil {
				p.ConnectionStatus = status
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
