package db

import (
	"database/sql"
	"hyper-hub/internal/models"
)

// GetSettings: User ki saved settings load karega
func GetSettings(hid string) (*models.Settings, error) {
	var s models.Settings
	err := DB.QueryRow(`
		SELECT theme, is_magic_pill_visible, pill_x, pill_y 
		FROM h_settings WHERE hid = $1`, hid).
		Scan(&s.Theme, &s.IsMagicPillVisible, &s.PillX, &s.PillY)

	if err == sql.ErrNoRows {
		// Naya user hai toh default settings de do
		return &models.Settings{Theme: "dark-green", IsMagicPillVisible: true}, nil
	}
	return &s, err
}

// UpsertSettings: Settings save ya update karega
func UpsertSettings(hid string, s models.Settings) error {
	_, err := DB.Exec(`
		INSERT INTO h_settings (hid, theme, is_magic_pill_visible, pill_x, pill_y, updated_at) 
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
		ON CONFLICT (hid) DO UPDATE SET 
			theme = EXCLUDED.theme,
			is_magic_pill_visible = EXCLUDED.is_magic_pill_visible,
			pill_x = EXCLUDED.pill_x,
			pill_y = EXCLUDED.pill_y,
			updated_at = CURRENT_TIMESTAMP
	`, hid, s.Theme, s.IsMagicPillVisible, s.PillX, s.PillY)
	return err
}
