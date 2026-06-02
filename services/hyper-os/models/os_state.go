package models

import (
	"gorm.io/gorm"
)

// 🚀 OS State Model
type OSState struct {
	gorm.Model
	HyperID     string         `gorm:"uniqueIndex;not null" json:"hyperId"` // User ID
	Profile     ProfileData    `gorm:"serializer:json" json:"profile"`      // JSON from Frontend
	Preferences PreferenceData `gorm:"serializer:json" json:"preferences"`
}

type ProfileData struct {
	Name      string `json:"name"`
	Nickname  string `json:"nickname"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatarUrl"`
	Bio       string `json:"bio"`
}

type PreferenceData struct {
	DockPosition string `json:"dockPosition"`
	DockAutoHide bool   `json:"dockAutoHide"`
	Wallpaper    string `json:"wallpaper"`
}
