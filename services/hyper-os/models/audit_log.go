package models

import (
	"gorm.io/gorm"
)

type AuditLog struct {
	gorm.Model
	HyperID string `gorm:"index;not null" json:"hyperId"`
	Action  string `json:"action" validate:"required"` // e.g., 'UPLOAD', 'DELETE', 'RENAME'
	Target  string `json:"target" validate:"required"` // e.g., 'fusion_core.py'
	Details string `json:"details"`                    // e.g., 'Node payload synchronized to VFS'
}
