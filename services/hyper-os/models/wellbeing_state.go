package models

import (
	"gorm.io/gorm"
)

// AppUsageStats stores granular details of how an app is used
type AppUsageStats struct {
	ActiveTime     int `json:"activeTime"`     // Time when app was focused (in seconds)
	BackgroundTime int `json:"backgroundTime"` // Time when app was just open in background (in seconds)
	LaunchCount    int `json:"launchCount"`    // Kitni baar open hui
}

// WellbeingState represents the user's digital wellbeing data securely
type WellbeingState struct {
	gorm.Model
	HyperID        string                   `gorm:"uniqueIndex;not null" json:"hyperId"`
	Date           string                   `json:"date"`                             // YYYY-MM-DD (Daily tracking ke liye, otherwise gorm.Model has CreatedAt)
	RealScreenTime int                      `json:"realScreenTime"`                   // Actual active time in seconds
	AppUsage       map[string]AppUsageStats `gorm:"serializer:json" json:"appUsage"`  // Granular app usage stats
	AppCombos      map[string]int           `gorm:"serializer:json" json:"appCombos"` // e.g., "canvas+explorer": 45
	DockApps       []string                 `gorm:"serializer:json" json:"dockApps"`  // Konsi apps us waqt pinned thi
}
