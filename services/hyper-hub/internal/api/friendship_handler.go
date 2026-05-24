package api

import (
	"encoding/json"
	"hyper-hub/internal/db"
	"hyper-hub/internal/events"
	"log"
	"net/http"
)

// 1. Friend Request bhejne ke liye
func SendFriendRequest(w http.ResponseWriter, r *http.Request) {
	// 🔥 FIX: Middleware se injected HID nikal rahe hain
	val := r.Context().Value(UserHIDKey)
	senderID, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Session Invalid", http.StatusUnauthorized)
		return
	}

	var req struct {
		ReceiverID string `json:"receiver_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO friendships (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')`
	_, err := db.DB.Exec(query, senderID, req.ReceiverID)
	if err != nil {
		http.Error(w, "Request already exists or DB error", http.StatusInternalServerError)
		return
	}

	events.PublishEvent("FRIEND_REQUEST_SENT", senderID+":"+req.ReceiverID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "Request sent"})
}

// 2. Friends list
func GetFriendsList(w http.ResponseWriter, r *http.Request) {
	// 🔥 FIX: Middleware se injected HID nikal rahe hain
	val := r.Context().Value(UserHIDKey)
	userID, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Session Invalid", http.StatusUnauthorized)
		return
	}

	query := `
		SELECT sender_id FROM friendships WHERE receiver_id = $1 AND status = 'accepted'
		UNION
		SELECT receiver_id FROM friendships WHERE sender_id = $1 AND status = 'accepted'`

	rows, err := db.DB.Query(query, userID)
	if err != nil {
		http.Error(w, "Failed to fetch friends", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	friends := []string{}
	for rows.Next() {
		var id string
		rows.Scan(&id)
		friends = append(friends, id)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string][]string{"friends": friends})
}

// 3. Accept Request
func AcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
	// 🔥 FIX: Middleware se injected HID nikal rahe hain
	val := r.Context().Value(UserHIDKey)
	receiverID, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Session Invalid", http.StatusUnauthorized)
		return
	}

	var req struct {
		SenderID string `json:"sender_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	query := `UPDATE friendships SET status = 'accepted' WHERE sender_id = $1 AND receiver_id = $2`
	_, err := db.DB.Exec(query, req.SenderID, receiverID)
	if err != nil {
		http.Error(w, "Failed to accept request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "Friend request accepted"})
}

// 4. Toggle Follow (Follow/Unfollow logic) - Ye pehle se sahi tha
func ToggleFollowHandler(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(UserHIDKey)
	followerID, ok := val.(string)
	if !ok {
		http.Error(w, "Unauthorized: Session Invalid", http.StatusUnauthorized)
		return
	}

	var req struct {
		FollowingID string `json:"following_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Safety check: khud ko follow na kare
	if followerID == req.FollowingID {
		http.Error(w, "Cannot follow yourself", http.StatusBadRequest)
		return
	}

	// 1. Check if already following
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2)`
	err := db.DB.QueryRow(checkQuery, followerID, req.FollowingID).Scan(&exists)

	if err != nil {
		log.Printf("❌ DB error in ToggleFollow: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 2. Toggle Logic
	if exists {
		// Unfollow (Delete)
		_, err = db.DB.Exec(`DELETE FROM follows WHERE follower_id=$1 AND following_id=$2`, followerID, req.FollowingID)
		if err == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"status": "unfollowed"})
			return
		}
	} else {
		// Follow (Insert)
		_, err = db.DB.Exec(`INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`, followerID, req.FollowingID)
		if err == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "followed"})
			return
		}
	}

	if err != nil {
		log.Printf("❌ Toggle Follow error: %v", err)
		http.Error(w, "Failed to update follow status", http.StatusInternalServerError)
	}
}
