package models

import (
	"time"
)

type Friendship struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	SenderID   string `gorm:"index;not null" json:"sender_id"`
	ReceiverID string `gorm:"index;not null" json:"receiver_id"`
	// Status: pending, accepted, blocked
	Status    string    `gorm:"default:'pending';index" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
