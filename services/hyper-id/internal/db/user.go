package db

import (
	"database/sql"
	"fmt"
	"hyper-id/internal/models"
)

// FindOrCreateUser checks if a user exists by their Google Sub ID.
// If not, it creates a new entry in the h_users table.
func FindOrCreateUser(googleSub, email string) (*models.User, error) {
	var user models.User
	user.Email = email // Google se mili email set kar rahe hain

	// 1. Pehle check karo user exist karta hai ya nahi
	// COALESCE use kiya hai taaki NULL username ki wajah se Scan error na aaye
	err := DB.QueryRow(`
		SELECT hid, COALESCE(username, ''), account_status 
		FROM h_users 
		WHERE google_sub = $1
	`, googleSub).Scan(&user.HID, &user.Username, &user.AccountStatus)

	if err == sql.ErrNoRows {
		// 2. Agar user nahi mila, toh naya insert karo
		fmt.Printf("New user detected: %s. Creating account...\n", email)

		err = DB.QueryRow(`
			INSERT INTO h_users (google_sub, email) 
			VALUES ($1, $2) 
			RETURNING hid, account_status
		`, googleSub, email).Scan(&user.HID, &user.AccountStatus)

		if err != nil {
			return nil, fmt.Errorf("failed to insert new user: %v", err)
		}

		user.Username = "" // Naye user ke paas username nahi hota
		return &user, nil
	}

	if err != nil {
		return nil, fmt.Errorf("database query error: %v", err)
	}

	return &user, nil
}
