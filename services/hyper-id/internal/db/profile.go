package db

import (
	"database/sql"
	"hyper-id/internal/models"
)

// GetUserProfile checks if a profile exists and returns it
func GetUserProfile(hid string) (*models.UserProfile, error) {
	var p models.UserProfile
	// DB variable internal/db/postgres.go se aa raha hai
	err := DB.QueryRow(`
		SELECT hid, first_name, last_name, nickname, avatar_url 
		FROM h_profiles WHERE hid = $1`, hid).
		Scan(&p.HID, &p.FirstName, &p.LastName, &p.Nickname, &p.AvatarURL)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}
