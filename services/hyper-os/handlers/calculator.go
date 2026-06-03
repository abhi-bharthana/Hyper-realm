package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// GET /api/v1/os/calculator/history
func GetCalculatorHistory(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	var history []models.CalculatorHistory
	// Latest calculation pehle dikhane ke liye order by desc
	result := database.DB.Where("hyper_id = ?", hyperID).Order("created_at desc").Limit(50).Find(&history)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch history"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": history})
}

// POST /api/v1/os/calculator/history
func SaveCalculation(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	var payload models.CalculatorHistory
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if err := validate.Struct(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Validation failed", "details": err.Error()})
	}

	payload.HyperID = hyperID

	if err := database.DB.Create(&payload).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save calculation"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": payload})
}

// DELETE /api/v1/os/calculator/history
func ClearCalculatorHistory(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	// User ki saari history delete mar do
	result := database.DB.Where("hyper_id = ?", hyperID).Delete(&models.CalculatorHistory{})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to clear history"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "History cleared successfully"})
}
