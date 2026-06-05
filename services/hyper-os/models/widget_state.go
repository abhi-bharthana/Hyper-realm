package models

import (
	"gorm.io/gorm"
)

// 🚀 FIXED: Changed int to float64 to support Framer Motion drag coordinates
type WidgetInstance struct {
	InstanceID string  `json:"instanceId"`
	WidgetID   string  `json:"widgetId"`
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	W          float64 `json:"w"`
	H          float64 `json:"h"`
}

type WidgetState struct {
	gorm.Model
	HyperID string           `gorm:"uniqueIndex;not null" json:"hyperId"`
	Widgets []WidgetInstance `gorm:"serializer:json" json:"widgets"`
}
