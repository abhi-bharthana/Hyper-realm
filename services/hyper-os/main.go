package main

import (
	"hyper-os/database"
	"hyper-os/handlers" // 👈 Apna naya package import kiya
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	// Connect & Migrate DB
	database.ConnectDB()

	app := fiber.New()
	app.Use(logger.New())

	// Health Check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "hyper-os is live ⚡"})
	})

	// 🚀 CORE API ROUTES
	api := app.Group("/api/v1")
	api.Get("/os", handlers.GetOSState)   // Frontend ko state dega
	api.Post("/os", handlers.SyncOSState) // Frontend se state lega

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Starting Hyper-OS Service on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
