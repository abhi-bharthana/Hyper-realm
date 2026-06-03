package models

import (
	"gorm.io/gorm"
)

// 🚀 OS State Model
type OSState struct {
	gorm.Model
	HyperID     string         `gorm:"uniqueIndex;not null" json:"hyperId"`
	Profile     ProfileData    `gorm:"serializer:json" json:"profile" validate:"required"`
	Preferences PreferenceData `gorm:"serializer:json" json:"preferences" validate:"required"`
}

type ProfileData struct {
	Name      string `json:"name" validate:"required,min=2"`
	Nickname  string `json:"nickname"` // Optional
	Username  string `json:"username" validate:"required"`
	AvatarURL string `json:"avatarUrl"` // Optional
	Bio       string `json:"bio"`       // Optional
}

type PreferenceData struct {
	// oneof check karega ki value in charon mein se ek hi ho
	DockPosition string `json:"dockPosition" validate:"required,oneof=top bottom left right"`
	DockAutoHide bool   `json:"dockAutoHide"`
	Wallpaper    string `json:"wallpaper" validate:"required"`
}
