package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// Validator ka ek global instance banate hain (performance ke liye best hai)
var validate = validator.New()

func SyncOSState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	var payload models.OSState
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload", "details": err.Error()})
	}

	// 🛡️ THE SHIELD: Yahan struct validation run hogi
	if err := validate.Struct(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Data validation failed. Matrix state rejected.",
			"details": err.Error(),
		})
	}

	payload.HyperID = hyperID

	var existingState models.OSState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&existingState)

	if result.Error == nil {
		existingState.Profile = payload.Profile
		existingState.Preferences = payload.Preferences
		database.DB.Save(&existingState)
		return c.JSON(fiber.Map{"status": "success", "message": "Hyper-OS Matrix updated!"})
	}

	database.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "message": "New Hyper-OS Matrix initialized!"})
}

func GetOSState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	var state models.OSState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&state)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "not_found", "message": "No OS state found"})
	}

	return c.JSON(state)
}
