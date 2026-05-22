package models

import "time"

type User struct {
	HID           string    `json:"hid" db:"hid"`
	GoogleSub     string    `json:"-" db:"google_sub"` // Never expose this to frontend
	Email         string    `json:"email" db:"email"`
	Username      string    `json:"username" db:"username"`
	AccountStatus string    `json:"status" db:"account_status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type UserProfile struct {
	HID       string `json:"hid" db:"hid"`
	FirstName string `json:"first_name" db:"first_name"`
	LastName  string `json:"last_name" db:"last_name"`
	Nickname  string `json:"nickname" db:"nickname"`
	AvatarURL string `json:"avatar_url" db:"avatar_url"`
}
