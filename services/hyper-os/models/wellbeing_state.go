package models

import (
	"gorm.io/gorm"
)

// Secure Wellbeing Model
type WellbeingState struct {
	gorm.Model
	HyperID         string       `gorm:"uniqueIndex;not null" json:"hyperId"`
	TotalOnlineTime int          `json:"totalOnlineTime"`
	AppUsage        AppUsageData `gorm:"serializer:json" json:"appUsage" validate:"required"`
}

// Custom type map for JSON serialization of App Usage
type AppUsageData map[string]int
