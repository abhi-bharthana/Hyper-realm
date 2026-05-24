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

// 1. GetProfileHandler: Authenticated user ka apna profile
func GetProfileHandler(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(UserHIDKey)
	hid, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Invalid Session", http.StatusUnauthorized)
		return
	}

	var p models.UserProfile
	query := `
        SELECT hid, nickname, COALESCE(bio, ''), COALESCE(avatar_url, ''), COALESCE(rank, 'Agent'), COALESCE(trust_score, 1.0) 
        FROM user_profiles 
        WHERE hid=$1`

	err := db.DB.QueryRow(query, hid).Scan(
		&p.HID, &p.Nickname, &p.Bio, &p.AvatarURL, &p.Rank, &p.TrustScore,
	)

	if err != nil {
		if err == sql.ErrNoRows {
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

			go events.PublishEvent("PROFILE_CREATED", map[string]interface{}{
				"hid":      hid,
				"nickname": defaultNickname,
				"action":   "PROFILE_CREATED",
			})

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

// 2. UpdateProfileHandler: Khud ka profile update/initialize karne ke liye
func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(UserHIDKey)
	hid, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var updateData struct {
		Nickname string `json:"nickname"`
		Bio      string `json:"bio"`
	}
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// 🎯 INTUITIVE UPSERT: Agar row nahi hai toh INSERT hogi, agar hai toh UPDATE hogi
	query := `
        INSERT INTO user_profiles (hid, nickname, bio, rank, trust_score) 
        VALUES ($1, $2, $3, 'Agent', 1.0)
        ON CONFLICT (hid) 
        DO UPDATE SET nickname = EXCLUDED.nickname, bio = EXCLUDED.bio`

	_, err := db.DB.Exec(query, hid, updateData.Nickname, updateData.Bio)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] Profile Upsert Failed for HID %s: %v", hid, err)
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	go events.PublishEvent("PROFILE_UPDATED", map[string]interface{}{
		"hid":      hid,
		"nickname": updateData.Nickname,
		"bio":      updateData.Bio,
		"action":   "PROFILE_UPDATED",
	})

	go events.PublishEvent("USER_INDEXED", map[string]interface{}{
		"id":       hid,
		"username": updateData.Nickname,
		"role":     "CITIZEN",
	})

	log.Printf("✅ [Hyper-Hub] Profile successfully established/updated via UPSERT for HID: %s", hid)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile Updated Successfully"})
}

// 4. SearchUsersHandler: Users ko nickname ya HID se dhoondhne ke liye
func SearchUsersHandler(w http.ResponseWriter, r *http.Request) {
	searchQuery := r.URL.Query().Get("q")

	if searchQuery == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]interface{}{})
		return
	}

	// 🔥 FIX: hid ko hid::TEXT mein cast kiya taaki Postgres ILIKE chala sake
	query := `
		SELECT hid, nickname, COALESCE(avatar_url, ''), COALESCE(rank, 'Agent')
		FROM user_profiles 
		WHERE nickname ILIKE $1 OR hid::TEXT ILIKE $1
		LIMIT 10
	`

	rows, err := db.DB.Query(query, "%"+searchQuery+"%")
	if err != nil {
		log.Printf("❌ [Hyper-Hub] Search DB Error: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var hid, nickname, avatar, rank string
		if err := rows.Scan(&hid, &nickname, &avatar, &rank); err != nil {
			log.Printf("❌ [Hyper-Hub] Row scan error: %v", err)
			continue
		}
		results = append(results, map[string]interface{}{
			"hid":        hid,
			"nickname":   nickname,
			"avatar_url": avatar,
			"rank":       rank,
		})
	}

	if results == nil {
		results = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
