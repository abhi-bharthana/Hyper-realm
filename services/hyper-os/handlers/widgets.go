package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// POST /api/v1/os/widgets/sync
func SyncWidgets(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	type Req struct {
		Widgets []models.WidgetInstance `json:"widgets"`
	}
	var payload Req

	// 🚀 FIXED: Added err.Error() detail to catch exact JSON mapping errors
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
	}

	var existingState models.WidgetState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&existingState)

	if result.Error == nil {
		// Update existing widgets
		existingState.Widgets = payload.Widgets
		database.DB.Save(&existingState)
		return c.JSON(fiber.Map{"status": "success", "message": "Widgets synced securely to Hyper Cloud!"})
	}

	// Create new entry
	newState := models.WidgetState{
		HyperID: hyperID,
		Widgets: payload.Widgets,
	}
	database.DB.Create(&newState)

	return c.JSON(fiber.Map{"status": "success", "message": "Widget space initialized!"})
}

// GET /api/v1/os/widgets
func GetWidgets(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	var state models.WidgetState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&state)

	if result.Error != nil {
		// Agar naya user hai, toh empty array bhejo
		return c.JSON(fiber.Map{"status": "success", "widgets": []models.WidgetInstance{}})
	}

	return c.JSON(fiber.Map{"status": "success", "widgets": state.Widgets})
}
