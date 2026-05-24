package api

import (
	"encoding/json"
	"hyper-hub/internal/db"
	"log"
	"net/http"
)

// --- Request Structs ---
type ConnectionReq struct {
	TargetHID string `json:"target_hid"`
}

// 1. Send Friend Request
func HandleSendRequest(w http.ResponseWriter, r *http.Request) {
	senderHID := r.Context().Value(UserHIDKey).(string)
	var req ConnectionReq
	json.NewDecoder(r.Body).Decode(&req)

	if req.TargetHID == "" || senderHID == req.TargetHID {
		http.Error(w, "Invalid target", http.StatusBadRequest)
		return
	}

	_, err := db.DB.Exec(`
        INSERT INTO h_connections (sender_hid, receiver_hid, status) 
        VALUES ($1, $2, 'pending') 
        ON CONFLICT (sender_hid, receiver_hid) DO NOTHING`,
		senderHID, req.TargetHID)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] Send Request Failed: %v", err)
		http.Error(w, "Failed to send request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Request sent"})
}

// 2. Accept Friend Request
func HandleAcceptRequest(w http.ResponseWriter, r *http.Request) {
	receiverHID := r.Context().Value(UserHIDKey).(string)
	var req ConnectionReq
	json.NewDecoder(r.Body).Decode(&req)

	// 🛡️ CAST INJECTION: String = UUID clash rokne ke liye WHERE clause me casting add ki
	_, err := db.DB.Exec(`
        UPDATE h_connections 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
        WHERE sender_hid::TEXT = $1::TEXT AND receiver_hid::TEXT = $2::TEXT AND status = 'pending'`,
		req.TargetHID, receiverHID)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] Accept Request Failed: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request accepted"})
}

// 3. Decline Friend Request
func HandleDeclineRequest(w http.ResponseWriter, r *http.Request) {
	receiverHID := r.Context().Value(UserHIDKey).(string)
	var req ConnectionReq
	json.NewDecoder(r.Body).Decode(&req)

	// 🛡️ CAST INJECTION: String = UUID clash yahan bhi bypass kiya
	_, err := db.DB.Exec(`
        DELETE FROM h_connections 
        WHERE sender_hid::TEXT = $1::TEXT AND receiver_hid::TEXT = $2::TEXT AND status = 'pending'`,
		req.TargetHID, receiverHID)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] Decline Request Failed: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Request declined"})
}

// 4. Get Pending Requests (Jo mujhe aayi hain)
func HandleGetPendingRequests(w http.ResponseWriter, r *http.Request) {
	myHID, ok := r.Context().Value(UserHIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 🎯 THE CORE FIX: ON aur WHERE conditions me explicit ::TEXT compile kiya
	// Isse Postgres bina nakhre kiye UUID aur VARCHAR ko text formats me scale karke evaluate kar lega.
	rows, err := db.DB.Query(`
        SELECT c.sender_hid::TEXT, u.nickname, COALESCE(u.rank, 'Agent') AS role 
        FROM h_connections c
        JOIN user_profiles u ON c.sender_hid::TEXT = u.hid::TEXT
        WHERE c.receiver_hid::TEXT = $1::TEXT AND c.status = 'pending'`, myHID)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] SQL Crash in HandleGetPendingRequests: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var requests []map[string]interface{}
	for rows.Next() {
		var hid, nickname, role string
		if err := rows.Scan(&hid, &nickname, &role); err != nil {
			log.Printf("⚠️ [Hyper-Hub] Row scan error: %v", err)
			continue
		}
		requests = append(requests, map[string]interface{}{
			"hid": hid, "nickname": nickname, "role": role, "time": "New",
		})
	}

	if requests == nil {
		requests = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// 5. Get Accepted Friends List (Jo mere confirmed friends hain)
func HandleGetFriendsList(w http.ResponseWriter, r *http.Request) {
	myHID, ok := r.Context().Value(UserHIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 🎯 SMART JOIN: Jo requests accepted hain, usme se saamne waale ki profile details nikaalo
	rows, err := db.DB.Query(`
        SELECT u.hid, u.nickname, COALESCE(u.rank, 'Agent') AS role 
        FROM h_connections c
        JOIN user_profiles u ON u.hid::TEXT = (CASE WHEN c.sender_hid::TEXT = $1::TEXT THEN c.receiver_hid::TEXT ELSE c.sender_hid::TEXT END)
        WHERE (c.sender_hid::TEXT = $1::TEXT OR c.receiver_hid::TEXT = $1::TEXT) AND c.status = 'accepted'`, myHID)

	if err != nil {
		log.Printf("❌ [Hyper-Hub] SQL Crash in HandleGetFriendsList: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var friends []map[string]interface{}
	for rows.Next() {
		var hid, nickname, role string
		if err := rows.Scan(&hid, &nickname, &role); err != nil {
			log.Printf("⚠️ [Hyper-Hub] Row scan error: %v", err)
			continue
		}
		friends = append(friends, map[string]interface{}{
			"hid": hid, "nickname": nickname, "role": role,
		})
	}

	if friends == nil {
		friends = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(friends)
}
