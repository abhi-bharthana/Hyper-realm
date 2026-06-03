package models

import (
	"gorm.io/gorm"
)

// 🧮 Calculator History Model
type CalculatorHistory struct {
	gorm.Model
	HyperID    string `gorm:"index;not null" json:"hyperId"`
	Type       string `json:"type" validate:"required,oneof=standard scientific currency unit"` // Kis type ki calculation thi
	Expression string `json:"expression" validate:"required"`                                   // e.g., "45 * 89" or "100 USD to INR"
	Result     string `json:"result" validate:"required"`
}
