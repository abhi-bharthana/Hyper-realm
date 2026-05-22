package models

// Settings represents the user's UI preferences
type Settings struct {
	Theme              string  `json:"theme"`
	IsMagicPillVisible bool    `json:"isMagicPillVisible"`
	PillX              float64 `json:"pillX"`
	PillY              float64 `json:"pillY"`
}
