package models

import "time"

type Client struct {
	ClientID     string    `json:"client_id"`
	ClientName   string    `json:"client_name"`
	ClientSecret string    `json:"client_secret"` // Ye hashed hona chahiye prod mein
	RedirectURI  string    `json:"redirect_uri"`
	CreatedAt    time.Time `json:"created_at"`
}
