package api

import (
	"database/sql"
	"encoding/json"
	"hyper-hub/internal/db"
	"hyper-hub/internal/events" // KAFKA EVENTS IMPORT
	"hyper-hub/internal/models"
	"log"
	"net/http"
)

func GetProfileHandler(w http.ResponseWriter, r *http.Request) {
	// Context se HID nikalna
	val := r.Context().Value(UserHIDKey)
	hid, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Invalid Session", http.StatusUnauthorized)
		return
	}

	var p models.UserProfile
	// COALESCE zaroori hai kyunki Postgres ke nullable columns NULL hone par Go Scan ko break kar dete hain
	query := `
        SELECT hid, nickname, COALESCE(bio, ''), COALESCE(avatar_url, ''), COALESCE(rank, 'Agent'), COALESCE(trust_score, 1.0) 
        FROM user_profiles 
        WHERE hid=$1`

	err := db.DB.QueryRow(query, hid).Scan(
		&p.HID, &p.Nickname, &p.Bio, &p.AvatarURL, &p.Rank, &p.TrustScore,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// --- LAZY LOADING: Agar profile nahi hai toh naya banao ---
			log.Printf("🆕 [Hyper-Hub] Creating new profile for HID: %s", hid)
			defaultNickname := "New_Commander"
			defaultBio := "Welcome to the Hyper-Realm. Set your bio."

			_, insertErr := db.DB.Exec(
				"INSERT INTO user_profiles (hid, nickname, bio, rank, trust_score) VALUES ($1, $2, $3, $4, $5)",
				hid, defaultNickname, defaultBio, "Agent", 1.0,
			)

			if insertErr != nil {
				log.Printf("❌ [Hyper-Hub] Profile Auto-create failed: %v", insertErr)
				http.Error(w, "Failed to initialize profile", http.StatusInternalServerError)
				return
			}

			// 🚀 KAFKA EVENT: Nayi profile banne par event fire karo
			go events.PublishEvent("PROFILE_CREATED", map[string]interface{}{
				"hid":      hid,
				"nickname": defaultNickname,
				"action":   "PROFILE_CREATED",
			})

			// Nayi profile return karo
			p = models.UserProfile{
				HID:        hid,
				Nickname:   defaultNickname,
				Bio:        defaultBio,
				Rank:       "Agent",
				TrustScore: 1.0,
			}
		} else {
			log.Printf("❌ [Hyper-Hub] Database Scan Error: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	// HID nikalna
	val := r.Context().Value(UserHIDKey)
	hid, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// JSON body parse karna
	var updateData struct {
		Nickname string `json:"nickname"`
		Bio      string `json:"bio"`
	}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// DB Update logic
	_, err := db.DB.Exec("UPDATE user_profiles SET nickname=$1, bio=$2 WHERE hid=$3",
		updateData.Nickname, updateData.Bio, hid)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] Profile Update Failed for HID %s: %v", hid, err)
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	// 🚀 KAFKA EVENT: Profile update hone par event fire karo
	go events.PublishEvent("PROFILE_UPDATED", map[string]interface{}{
		"hid":      hid,
		"nickname": updateData.Nickname,
		"bio":      updateData.Bio,
		"action":   "PROFILE_UPDATED",
	})

	log.Printf("✅ [Hyper-Hub] Profile updated for HID: %s", hid)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile Updated Successfully"})
}
