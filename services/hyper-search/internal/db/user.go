package db

import (
	"database/sql"
)

// User table structure (Tere table ke columns se match karo)
type User struct {
	ID        string `json:"id"`
	HID       string `json:"hid"`
	Nickname  string `json:"nickname"`
	Bio       string `json:"bio"`
	Rank      string `json:"rank"`
	AvatarURL string `json:"avatar_url"`
	Posts     int    `json:"posts"`
}

// DB variable main.go mein initialize hona chahiye
var DB *sql.DB

func GetUserByHID(hid string) (*User, error) {
	user := &User{}

	// SQL Query: Check kar ki tere column ka naam 'hid' hi hai
	query := `SELECT id, hid, nickname, bio, rank, avatar_url, posts 
              FROM users WHERE hid = $1 LIMIT 1`

	err := DB.QueryRow(query, hid).Scan(
		&user.ID,
		&user.HID,
		&user.Nickname,
		&user.Bio,
		&user.Rank,
		&user.AvatarURL,
		&user.Posts,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}
