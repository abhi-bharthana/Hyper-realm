package api

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"

	"hyper-id/internal/db"
)

func HandleSyncSearch(w http.ResponseWriter, r *http.Request) {
	// 1. DB se saare active users fetch karo
	rows, err := db.DB.Query("SELECT hid, username, first_name, last_name, nickname FROM h_profiles")
	if err != nil {
		http.Error(w, "DB Query failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	count := 0
	searchUrl := "http://hyper-search:8082/api/v1/search/index"

	for rows.Next() {
		var hid, username, firstName, lastName, nickname string
		rows.Scan(&hid, &username, &firstName, &lastName, &nickname)

		// 2. HTTP POST hit karo (Wahi payload jo onboarding mein use kiya tha)
		payload := map[string]interface{}{
			"hid":        hid,
			"username":   username,
			"first_name": firstName,
			"last_name":  lastName,
			"nickname":   nickname,
		}

		jsonData, _ := json.Marshal(payload)
		resp, err := http.Post(searchUrl, "application/json", bytes.NewBuffer(jsonData))
		if err == nil {
			resp.Body.Close()
			count++
		}
	}

	log.Printf("⚡ [Hydration Complete] Synced %d users to Search Engine!", count)
	w.Write([]byte("Sync successful. Synced " + string(rune(count)) + " users."))
}
