package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// POST /api/v1/os/permissions/toggle
func TogglePermission(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	type Req struct {
		AppID          string `json:"app_id"`
		PermissionType string `json:"permission_type"`
		IsGranted      bool   `json:"is_granted"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request format"})
	}

	// Upsert Logic (Agar permission nahi hai toh banayega, hai toh update karega)
	var perm models.SystemPermission
	result := database.DB.Where("hyper_id = ? AND app_id = ? AND permission_type = ?", hyperID, body.AppID, body.PermissionType).First(&perm)

	if result.Error == nil {
		// Update existing
		perm.IsGranted = body.IsGranted
		database.DB.Save(&perm)
	} else {
		// Create new
		newPerm := models.SystemPermission{
			HyperID:        hyperID,
			AppID:          body.AppID,
			PermissionType: body.PermissionType,
			IsGranted:      body.IsGranted,
		}
		database.DB.Create(&newPerm)
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Security matrix updated"})
}
