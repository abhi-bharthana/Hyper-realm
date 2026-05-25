package models

import "time"

// User represents the core identity in the h_users table
type User struct {
	HID           string    `json:"hid" db:"hid"`
	GoogleSub     string    `json:"-" db:"google_sub"` // Never expose this to frontend
	Email         string    `json:"email" db:"email"`
	Username      string    `json:"username" db:"username"`
	AccountStatus string    `json:"status" db:"account_status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

// UserProfile represents the isolated personal details in the h_profiles table
type UserProfile struct {
	HID       string `json:"hid" db:"hid"`
	FirstName string `json:"first_name" db:"first_name"`
	LastName  string `json:"last_name" db:"last_name"`
	Nickname  string `json:"nickname" db:"nickname"`
	AvatarURL string `json:"avatar_url" db:"avatar_url"`
	Gender    string `json:"gender" db:"gender"` // 🚀 Naya field add ho gaya
}
