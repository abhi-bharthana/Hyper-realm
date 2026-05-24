// File: services/hyper-search/internal/engine/indexer.go
package engine

import (
	"context"
	"fmt"
	"log"
)

// IndexUser shared logic hai jo Kafka aur HTTP dono ke liye kaam karega
// Capital 'I' hona zaroori hai taaki yeh main package se access ho sake
func IndexUser(user map[string]interface{}) error {
	userID := ""
	if val, ok := user["hid"]; ok {
		userID = fmt.Sprintf("%v", val)
	} else if val, ok := user["id"]; ok {
		userID = fmt.Sprintf("%v", val)
	}

	document := map[string]interface{}{
		"id":         userID,
		"username":   user["username"],
		"role":       "User",
		"first_name": user["first_name"],
		"last_name":  user["last_name"],
		"nickname":   user["nickname"],
	}

	_, err := FlashClient.Collection("users").Documents().Upsert(context.Background(), document)
	if err != nil {
		return err
	}
	log.Printf("⚡ [Engine] User '%v' indexed successfully!", user["username"])
	return nil
}
