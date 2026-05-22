package models

import "time"

type UserProfile struct {
	HID        string    `json:"hid"`
	Nickname   string    `json:"nickname"`
	Bio        string    `json:"bio"`
	AvatarURL  string    `json:"avatar_url"`
	Rank       string    `json:"rank"`
	TrustScore float64   `json:"trust_score"`
	CreatedAt  time.Time `json:"created_at"`
}
