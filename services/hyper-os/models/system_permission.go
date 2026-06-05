package models

import (
	"gorm.io/gorm"
)

type SystemPermission struct {
	gorm.Model
	// Compound Unique Index: Ek user ki ek app ke paas ek permission ek hi baar ho sakti hai
	HyperID        string `gorm:"uniqueIndex:idx_user_app_perm;not null" json:"hyperId"`
	AppID          string `gorm:"uniqueIndex:idx_user_app_perm;not null" json:"appId"`          // e.g., 'com.weather.app'
	PermissionType string `gorm:"uniqueIndex:idx_user_app_perm;not null" json:"permissionType"` // e.g., 'storage:drive_write'
	IsGranted      bool   `gorm:"default:false" json:"isGranted"`
}
