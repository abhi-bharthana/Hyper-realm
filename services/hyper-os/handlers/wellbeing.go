package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// GET /api/v1/os/wellbeing
func GetWellbeingState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	var state models.WellbeingState

	result := database.DB.Where("hyper_id = ?", hyperID).First(&state)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "not_found", "message": "No wellbeing data found"})
	}

	return c.JSON(state)
}

// POST /api/v1/os/wellbeing (TAMPER-PROOF SYNC)
func SyncWellbeingState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	var payload models.WellbeingState

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload", "details": err.Error()})
	}

	payload.HyperID = hyperID

	var existingState models.WellbeingState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&existingState)

	if result.Error == nil {
		// 🛡️ TAMPER-PROOF LOGIC: Hum sirf badhti hui (increasing) values ko accept karenge!
		// Agar user reset karke 0 bheje, tab bhi DB mein old maximum value hi rahegi.

		if payload.TotalOnlineTime > existingState.TotalOnlineTime {
			existingState.TotalOnlineTime = payload.TotalOnlineTime
		}

		// App Usage array ko bhi safely merge karenge
		if existingState.AppUsage == nil {
			existingState.AppUsage = make(models.AppUsageData)
		}

		for app, time := range payload.AppUsage {
			// Sirf tab update karo jab naya time purane time se zyada ho
			if time > existingState.AppUsage[app] {
				existingState.AppUsage[app] = time
			}
		}

		database.DB.Save(&existingState)
		return c.JSON(fiber.Map{"status": "success", "message": "Secure Wellbeing Matrix updated!"})
	}

	// Agar user ka first time hai, toh naya record bana do
	database.DB.Create(&payload)
	return c.JSON(fiber.Map{"status": "success", "message": "Wellbeing Tracker initialized!"})
}
