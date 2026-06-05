package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// GET /api/v1/os/wellbeing
// Ye function frontend ko latest wellbeing state dega jab OS boot hoga
func GetWellbeingState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	var state models.WellbeingState

	result := database.DB.Where("hyper_id = ?", hyperID).First(&state)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  "not_found",
			"message": "No wellbeing data found",
		})
	}

	return c.JSON(state)
}

// POST /api/v1/os/wellbeing/telemetry (TAMPER-PROOF SYNC V2)
// Ye function securely real-time telemetry data sync karega
func SyncWellbeingState(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	var payload models.WellbeingState

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
	}

	payload.HyperID = hyperID

	var existingState models.WellbeingState
	result := database.DB.Where("hyper_id = ?", hyperID).First(&existingState)

	if result.Error == nil {
		// 🛡️ TAMPER-PROOF LOGIC 2.0: Sirf badhti hui values (Deltas) accept hongi!

		// 1. Real Screen Time Security
		if payload.RealScreenTime > existingState.RealScreenTime {
			existingState.RealScreenTime = payload.RealScreenTime
		}

		// 2. Active vs Background App Usage Security
		if existingState.AppUsage == nil {
			existingState.AppUsage = make(map[string]models.AppUsageStats)
		}

		for appID, newStats := range payload.AppUsage {
			existingStats := existingState.AppUsage[appID] // Struct copy

			// Har metric ko individual level par protect kar rahe hain
			if newStats.ActiveTime > existingStats.ActiveTime {
				existingStats.ActiveTime = newStats.ActiveTime
			}
			if newStats.BackgroundTime > existingStats.BackgroundTime {
				existingStats.BackgroundTime = newStats.BackgroundTime
			}
			if newStats.LaunchCount > existingStats.LaunchCount {
				existingStats.LaunchCount = newStats.LaunchCount
			}

			// Map mein wapas assign karna zaroori hai (Go map struct mutation fix)
			existingState.AppUsage[appID] = existingStats
		}

		// 3. App Combos Security (e.g. canvas+explorer)
		if existingState.AppCombos == nil {
			existingState.AppCombos = make(map[string]int)
		}

		for combo, newCount := range payload.AppCombos {
			if newCount > existingState.AppCombos[combo] {
				existingState.AppCombos[combo] = newCount
			}
		}

		// Save safely to database
		database.DB.Save(&existingState)
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Secure Wellbeing V2 Matrix updated!",
		})
	}

	// Agar user pehli baar telemetry bhej raha hai
	database.DB.Create(&payload)
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Wellbeing Tracker V2 initialized!",
	})
}
