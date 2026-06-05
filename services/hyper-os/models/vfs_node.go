package models

import (
	"gorm.io/gorm"
)

// VFSNode represents both Files and Folders in the OS
type VFSNode struct {
	gorm.Model
	HyperID string `gorm:"index;not null" json:"hyperId"`

	Name string `json:"name" validate:"required"` // e.g., 'weather.txt', 'vault'
	Type string `json:"type" validate:"required,oneof=FILE FOLDER"`

	// 🚀 O(1) Query Pathing System
	ParentPath string `gorm:"index;not null" json:"parentPath"`                   // e.g., '/home/user/app_data'
	FullPath   string `gorm:"uniqueIndex:idx_user_path;not null" json:"fullPath"` // e.g., '/home/user/app_data/weather.txt'

	// 📦 MinIO Payload Links (Null for Folders)
	ObjectKey string `json:"objectName"` // e.g., 'abhishek-babu-node/app_data/weather.txt'
	Size      int64  `json:"fileSize"`
	MimeType  string `json:"mimeType"`

	// 🛡️ System Constraints
	Owner      string `gorm:"default:'user'" json:"owner"`     // 'user' or 'system'
	IsReadOnly bool   `gorm:"default:false" json:"isReadOnly"` // TRUE for 'vault'
}
