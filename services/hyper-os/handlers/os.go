package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// POST /api/v1/os - State ko DB mein sync karega
func SyncOSState(c *fiber.Ctx) error {
	// TODO: Step 2 mein ye JWT middleware se aayega
	// Abhi test karne ke liye ek hardcoded ID use kar rahe hain
	hyperID := "abhi-hyper-root"

	var payload models.OSState
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload", "details": err.Error()})
	}

	payload.HyperID = hyperID

	var existingState models.OSState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&existingState)

	if result.Error == nil {
		// Update existing user state
		existingState.Profile = payload.Profile
		existingState.Preferences = payload.Preferences
		database.DB.Save(&existingState)
		return c.JSON(fiber.Map{"status": "success", "message": "Hyper-OS Matrix updated!"})
	}

	// Agar user naya hai, toh DB mein nayi row create karo
	database.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "message": "New Hyper-OS Matrix initialized!"})
}

// GET /api/v1/os - State DB se fetch karega
func GetOSState(c *fiber.Ctx) error {
	// TODO: JWT integration ke baad isko dynamic karenge
	hyperID := "abhi-hyper-root"

	var state models.OSState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&state)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "not_found", "message": "No OS state found"})
	}

	// Sidha JSON return maro jo Zustand store mein baithega
	return c.JSON(state)
}
