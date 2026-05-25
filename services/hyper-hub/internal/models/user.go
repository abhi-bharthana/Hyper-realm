package models

import "time"

// UserProfile represents the public/private profile details of an operator
type UserProfile struct {
	HID        string    `json:"hid"`
	Nickname   string    `json:"nickname"`
	Bio        string    `json:"bio"`
	AvatarURL  string    `json:"avatar_url"`
	Gender     string    `json:"gender"` // 🚀 NAYA FIELD YAHAN ADD KIYA HAI
	Rank       string    `json:"rank"`
	TrustScore float64   `json:"trust_score"`
	CreatedAt  time.Time `json:"created_at"`
}
